# Review Code Skill

## Purpose

Use this skill before preparing or finalizing a pull request.

The goal is to review the code like a careful maintainer and make sure the change is simple, focused, safe, and easy to understand.

## When to Use This Skill

Use this skill when:

* A feature is ready for pull request.
* Code changes have been made for an issue.
* A page, component, style, or script has been added or updated.
* The user asks to review the work before opening a PR.

## Review Steps

### 1. Check the Scope

Confirm that the change only addresses the issue being worked on.

Look for:

* Unrelated file changes
* Large changes that could have been smaller
* Accidental formatting changes
* Unnecessary refactoring

### 2. Check Simplicity

Confirm that the implementation is simple and maintainable.

Look for:

* Unnecessary dependencies
* Over-complicated logic
* Repeated code that can be simplified
* Complex patterns that are not needed for a small website feature

### 3. Check Website Consistency

Confirm that the change fits the existing community website.

Look for:

* Similar visual style
* Consistent naming
* Clear text
* Friendly community tone
* Mobile-friendly layout

### 4. Check Accessibility

Confirm that users can interact with the feature easily.

Look for:

* Clear buttons and links
* Useful labels
* Semantic HTML where possible
* Keyboard-friendly interactions
* Text that is readable on small screens

### 5. Check Functionality

Confirm that the feature works as expected.

Look for:

* Broken links
* Console errors
* Missing files
* Incorrect routes
* Buttons that do not respond
* State that does not reset properly

### 6. Check PR Readiness

Before the PR is created, prepare:

* A short summary of what changed
* A clear list of testing performed
* Any known limitations
* Any follow-up tasks

## Output Format

When this skill is used, respond with:

### Review Summary

Briefly explain the overall quality of the change.

### What Looks Good

List the parts that are working well.

### Issues Found

List any problems that should be fixed before PR.

### Suggested Improvements

List small improvements only if they are useful.

### PR Readiness

State one of the following:

* Ready for PR
* Ready after small fixes
* Needs more work before PR
