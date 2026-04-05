# 12 — Screen Specs

## Auth

## Welcome Screen
Purpose:
- explain value proposition
- route to sign in or sign up

Sections:
- app title
- short subtitle
- primary CTA
- secondary CTA

## Sign In
Fields:
- email
- password

Actions:
- sign in
- forgot password
- switch to sign up

## Sign Up
Fields:
- display name
- email
- password
- confirm password

Actions:
- create account

## Feed Tab

## Feed Home
Components:
- region selector
- lost/found filter tabs
- feed list
- empty state
- pull to refresh

Card fields:
- image
- type badge
- title
- category
- city/region
- relative date

## Post Detail
For public viewers:
- image gallery
- title
- summary
- structured attributes
- location label
- posted time
- action button to message

For owner:
- edit
- resolve
- archive
- retry analysis if needed
- view proactive matches

## Search Tab

## Search Home
Components:
- large natural-language input
- quick filters
- recent searches optional
- CTA button

## Search Results
Components:
- summary of query
- match list
- explanation chips
- filters/sort
- empty state

## Create Tab

## Create Entry Screen
Choices:
- I found an item
- I lost an item

## Create Found Item
Fields:
- images
- short description
- city/region
- place found
- date found

UI states:
- image upload progress
- AI processing banner after submit if still pending

## Create Lost Item
Fields:
- description
- city/region
- category optional
- brand optional
- color optional
- place lost
- date lost

## Review Screen
Show final data before submit.

## Inbox Tab

## Conversations List
Each row:
- avatar
- name
- post title/context
- latest message
- time
- unread badge

## Conversation Detail
Components:
- header with counterpart + post context
- message list
- composer
- report action
- optional mark as returned CTA if owner

## Profile Tab

## Profile Home
Sections:
- avatar
- display name
- home city/region
- my posts
- my items history
- settings entry

## My Posts
Filters:
- all
- lost
- found
- active
- resolved

## My Item History
This is the user's AI/profile view over all submitted items.

Each row may show:
- image
- title
- type
- current status
- AI extraction completeness

## Edit Profile
Fields:
- display name
- avatar
- bio optional
- home city/region

## Shared Modal Flows

## Report Content Modal
- reason selector
- note field
- submit

## Mark Resolved Modal
- confirmation text
- optional note

## Design Notes

- keep forms short and sectioned
- put AI explanations behind concise text
- use strong empty states to drive action
