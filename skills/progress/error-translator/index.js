#!/usr/bin/env node

class ErrorTranslator {
  constructor(config = {}) {
    this.name = 'error-translator';
    this.version = '1.0.0';
    this.description =
      'Convert technical error messages to plain English — references MDN and common patterns';
  }

  translate(errorText) {
    if (!errorText) return { original: '', translation: 'No error provided', suggestions: [] };

    const patterns = [
      // Node.js / JavaScript
      {
        match: /(Cannot find module|cannot find module|MODULE_NOT_FOUND)/i,
        translation: 'A file or package is missing.',
        suggestion: 'Check you ran "npm install" and that the file path is correct.',
      },
      {
        match: /(ENOENT|no such file or directory)/i,
        translation: 'The system tried to access a file that does not exist.',
        suggestion:
          'Check the file path for typos. Use an absolute path or verify the file was created first.',
      },
      {
        match: /EACCES|permission denied/i,
        translation: 'Your system is blocking access to this file or folder.',
        suggestion:
          'Try running the command with administrator privileges, or check file permissions.',
      },
      {
        match: /EADDRINUSE|port already in use/i,
        translation: 'Another program is already using this network port.',
        suggestion: 'Close the other program or use a different port number (e.g., PORT=3001).',
      },
      {
        match: /ECONNREFUSED|connection refused/i,
        translation: 'Could not connect to the server — it may be down or not running.',
        suggestion: 'Make sure the server is running and the address is correct.',
      },
      {
        match: /ETIMEDOUT|timed? ?out/i,
        translation: 'The connection took too long and was cancelled.',
        suggestion: 'Check your internet connection or increase the timeout value if possible.',
      },
      {
        match: /ENOSPC|no space left/i,
        translation: 'Your hard drive is full.',
        suggestion:
          'Free up disk space by deleting temporary files or uninstalling unused programs.',
      },
      {
        match: /ECONNRESET|socket hang up/i,
        translation: 'The connection was unexpectedly closed.',
        suggestion:
          'This is often a network issue. Try again, or check if a firewall is blocking the connection.',
      },
      {
        match: /UNABLE_TO_VERIFY_LEAF_SIGNATURE|certificate error/i,
        translation: 'Your computer cannot verify the security certificate.',
        suggestion:
          'Check your system date is correct, or set NODE_TLS_REJECT_UNAUTHORIZED=0 (not recommended for production).',
      },

      // NPM
      {
        match: /npm ERR.*404/i,
        translation: 'The package you tried to install was not found.',
        suggestion: 'Check the package name for typos. It may have been removed from the registry.',
      },
      {
        match: /npm ERR.*code EINTEGRITY/i,
        translation: 'The downloaded file does not match the expected checksum.',
        suggestion: 'Clear your npm cache with "npm cache clean --force" and try again.',
      },
      {
        match: /(npm WARN|npm ERR).*deprecated/i,
        translation: 'A package you are using is outdated and may stop working.',
        suggestion: 'Check for a newer version of the package or find an alternative.',
      },

      // Git
      {
        match: /(fatal|error).*not a git repository/i,
        translation: 'This folder is not a git repository yet.',
        suggestion: 'Run "git init" to create one, or check you are in the right folder.',
      },
      {
        match: /(fatal|error).*pathspec.*did not match/i,
        translation: 'Git cannot find the file or folder you referenced.',
        suggestion: 'Check the file name for typos and verify it exists.',
      },
      {
        match: /(fatal|error).*merge conflict/i,
        translation: 'Git cannot automatically combine two sets of changes.',
        suggestion:
          'Open the conflicting files, look for the <<<<<<< markers, and choose which version to keep.',
      },
      {
        match: /(fatal|error).*uncommitted changes/i,
        translation: 'You have unsaved changes that need to be committed first.',
        suggestion:
          'Run "git stash" to save them temporarily, or "git commit" to save them permanently.',
      },
      {
        match: /(fatal|error).*failed to push/i,
        translation: 'Your changes could not be sent to the remote repository.',
        suggestion: 'Pull the latest changes first with "git pull", then try again.',
      },
      {
        match: /(fatal|error).*no upstream/i,
        translation: 'This branch is not linked to a remote branch yet.',
        suggestion: 'Run "git push --set-upstream origin <branch-name>" to link it.',
      },

      // General
      {
        match: /(cannot read|Cannot read).*null/i,
        translation: 'The code tried to access a value that is empty (null).',
        suggestion:
          'Check that the data exists before trying to use it. Add a check like "if (data) { ... }".',
      },
      {
        match: /(cannot read|Cannot read).*undefined/i,
        translation: 'The code tried to access a value that has not been set yet.',
        suggestion: 'Make sure the variable or property is assigned a value before accessing it.',
      },
      {
        match: /(undefined|is not defined|is not a function)/i,
        translation: 'The code tried to use something that does not exist.',
        suggestion:
          'Check that all variables and functions are spelled correctly and defined before use.',
      },
      {
        match: /(invalid|unexpected).*token/i,
        translation: 'There is a typo in the code — something is misplaced.',
        suggestion:
          'Check for missing commas, brackets, or quotes. Use a linter to catch these automatically.',
      },
      {
        match: /(out of memory|heap out)/i,
        translation: 'The program used too much memory.',
        suggestion: 'Reduce the data size or increase the memory limit with --max-old-space-size.',
      },
      {
        match: /(syntax|parsing).*error/i,
        translation: 'The code has a mistake in its structure.',
        suggestion:
          'Look for missing punctuation or brackets. Use a code editor with syntax highlighting.',
      },
    ];

    for (const p of patterns) {
      if (p.match.test(errorText)) {
        return {
          original: errorText.slice(0, 200),
          translation: p.translation,
          suggestion: p.suggestion,
        };
      }
    }

    return {
      original: errorText.slice(0, 200),
      translation: 'This error does not match a known pattern.',
      suggestion: 'Copy the full error and search for it online, or ask the AI assistant for help.',
    };
  }

  batchTranslate(errors = []) {
    return errors.map(e => this.translate(e));
  }

  toJSON() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      knownPatterns: 24,
      references: ['MDN Web Docs', 'Node.js error documentation', 'Common CLI error patterns'],
    };
  }
}

if (require.main === module) {
  const skill = new ErrorTranslator();
  const input = process.argv.slice(2).join(' ') || 'Error: Cannot find module "something"';
  console.log(JSON.stringify(skill.translate(input), null, 2));
}

module.exports = ErrorTranslator;
