package core

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

const stateFile = "blockchain_state.json"

type persistedState struct {
	State  map[string]int    `json:"state"`
	Nonces map[string]uint64 `json:"nonces"`
}

// SaveState saves the current chain state to disk
func (c *Chain) SaveState() error {
	c.mu.RLock()
	defer c.mu.RUnlock()

	state := &persistedState{
		State:  c.State,
		Nonces: c.Nonces,
	}

	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling state: %v\n", err)
		return err
	}

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(stateFile), 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		return err
	}

	tmpFile := stateFile + ".tmp"
	if err := os.WriteFile(tmpFile, data, 0644); err != nil {
		fmt.Printf("Error writing temp file %s: %v\n", tmpFile, err)
		return err
	}

	// Atomic rename
	if err := os.Rename(tmpFile, stateFile); err != nil {
		// If rename fails (e.g., cross-device link), try copy instead
		fmt.Printf("Rename failed, trying copy: %v\n", err)
		if err := copyFile(tmpFile, stateFile); err != nil {
			fmt.Printf("Error copying file: %v\n", err)
			return err
		}
	}

	fmt.Printf("Successfully saved state to %s\n", stateFile)
	return nil
}

// LoadState loads the chain state from disk
// copyFile copies the contents from src to dst atomically
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	tmpDst := dst + ".new"
	out, err := os.Create(tmpDst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err = io.Copy(out, in); err != nil {
		return err
	}

	// Ensure all data is written to disk
	if err := out.Sync(); err != nil {
		return err
	}

	if err := out.Close(); err != nil {
		return err
	}

	return os.Rename(tmpDst, dst)
}

func (c *Chain) LoadState() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	fmt.Printf("Attempting to load state from %s\n", stateFile)
	data, err := os.ReadFile(stateFile)
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Println("No saved state found, using defaults")
			return nil
		}
		fmt.Printf("Error reading state file: %v\n", err)
		return err
	}

	var state persistedState
	if err := json.Unmarshal(data, &state); err != nil {
		fmt.Printf("Error unmarshaling state: %v\n", err)
		return err
	}

	c.State = state.State
	c.Nonces = state.Nonces
	fmt.Printf("Successfully loaded state from %s\n", stateFile)
	return nil
}
