package repository

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"time"
)

// HashToken calculates SHA-256 hash of a plain token string
func HashToken(plainToken string) string {
	hash := sha256.Sum256([]byte(plainToken))
	return hex.EncodeToString(hash[:])
}

// GenerateRandomToken generates a cryptographically secure random 32-byte hex string (64 characters)
func GenerateRandomToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// CreateRefreshToken creates a new plain refresh token, hashes it, and stores the hash in user_sessions DB table
func CreateRefreshToken(userID string) (string, error) {
	plainToken, err := GenerateRandomToken()
	if err != nil {
		return "", err
	}

	tokenHash := HashToken(plainToken)
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 days expiration

	query := `
		INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err = DB.Exec(query, userID, tokenHash, expiresAt)
	if err != nil {
		return "", err
	}

	return plainToken, nil
}

// RotateRefreshToken performs Token Rotation & Reuse Detection on user_sessions table
// If a revoked token is presented, Reuse Detection triggers and revokes ALL active sessions/tokens for that user!
func RotateRefreshToken(plainToken string) (newPlainToken string, userID string, err error) {
	tokenHash := HashToken(plainToken)

	var tokenID string
	var uID string
	var expiresAt time.Time
	var revokedAt sql.NullTime

	query := `
		SELECT id, user_id, expires_at, revoked_at
		FROM user_sessions
		WHERE refresh_token_hash = $1
	`
	rowErr := DB.QueryRow(query, tokenHash).Scan(&tokenID, &uID, &expiresAt, &revokedAt)
	if rowErr != nil {
		return "", "", errors.New("INVALID_REFRESH_TOKEN")
	}

	// REUSE DETECTION MECHANISM (Security Best Practice)
	// If the refresh token was ALREADY revoked previously, a potential token theft has occurred!
	// Immediately revoke ALL sessions/tokens belonging to this user for safety!
	if revokedAt.Valid {
		revokeAllQuery := `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`
		_, _ = DB.Exec(revokeAllQuery, uID)
		return "", uID, errors.New("REUSE_DETECTED")
	}

	// Check Expiration
	if time.Now().After(expiresAt) {
		return "", uID, errors.New("EXPIRED_REFRESH_TOKEN")
	}

	// REVOKE THE CURRENT REFRESH TOKEN (Rotation)
	revokeQuery := `UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1`
	_, err = DB.Exec(revokeQuery, tokenID)
	if err != nil {
		return "", uID, err
	}

	// ISSUE NEW PLAIN REFRESH TOKEN & SAVE NEW HASH (Rotation)
	newPlainToken, err = CreateRefreshToken(uID)
	if err != nil {
		return "", uID, err
	}

	return newPlainToken, uID, nil
}

// RevokeRefreshToken revokes the specified refresh token in user_sessions DB table
func RevokeRefreshToken(plainToken string) error {
	tokenHash := HashToken(plainToken)
	query := `UPDATE user_sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1 AND revoked_at IS NULL`
	_, err := DB.Exec(query, tokenHash)
	return err
}
