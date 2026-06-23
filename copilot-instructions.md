# Repository Instructions

This repository contains the Microsoft Malta AI User Group community website.

The website should remain simple, lightweight, accessible, and easy for community contributors to maintain.

## General Development Guidelines

When working on an issue:

* Create a new feature branch before making changes.
* Use a clear branch name related to the issue.
* Keep the change focused on the issue being worked on.
* Avoid changing unrelated files.
* Follow the existing folder structure and naming style.
* Reuse existing layout, styling, and components where possible.
* Keep the implementation simple and easy to review.

## Website Style Guidelines

When adding or updating pages:

* Match the existing look and feel of the community website.
* Keep text clear, friendly, and community-focused.
* Use simple page layouts that work well on desktop and mobile.
* Avoid unnecessary animations or heavy dependencies.
* Do not redesign the whole website unless the issue specifically asks for it.

## Technical Guidelines

Prefer simple static website patterns unless the issue clearly requires something more advanced.

Use:

* Existing project structure
* Existing styling approach
* Static content where possible
* Simple JavaScript only when interactivity is needed

Avoid:

* Adding a backend
* Adding a database
* Adding authentication
* Introducing new frameworks without a strong reason
* Adding external APIs unless explicitly requested

## Accessibility Guidelines

When creating interactive elements:

* Use semantic HTML where possible.
* Use readable text and clear labels.
* Make buttons and links easy to understand.
* Ensure the feature can be used on mobile.
* Avoid relying only on color to communicate meaning.

## Pull Request Guidelines

Before preparing a pull request:

* Review the changed files.
* Confirm the feature works locally if a local run command is available.
* Confirm no unrelated files were changed.
* Add a clear PR summary.
* Add testing notes explaining what was checked.
* Use the review-code skill before finalizing the PR.

## PR Summary Format

Use this format when creating a pull request:

### Summary

Explain what changed in 2-4 bullet points.

### Testing

List what was tested manually or through available commands.

### Notes

Mention anything useful for reviewers, including limitations or follow-up work.
