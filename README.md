# What is `veitag`?

Vei as of the word `vehicle`. And the word `tag` in a way of QR Codes and tags.

This is a project I've been thinking of making for a really long time.
Starting it as a product etc.\
Well, I didn't, surprise, surprise! I swear I got a valid reason now lol.\
I suck at front-end and had really hard time trying to implement this stuff to front-end and decided it was not really worth it.

Feel free to develop a front-end for this project and use it.
Don't forget to share credits tho!

## veitag has the following features:
- an auth system (login/register with JWT)
- uploads/creates QR Codes for that specific user to a CDN (specifically, bunny.net)
- optimizes profile avatars using sharp and uploads them to a CDN as well (bunny)
- has contacts
- uses prisma
- also my first nest.js project so has a special spot for me lol

## How to use it?

You need to create an .env file with the following content:
```env
DATABASE_URL="YOUR_DATABASE_URL"
JWT="test" # JWT secret key, maybe something other than test?!
PORT=3000
CDN_ACCESS_KEY="YOUR_ACCESS_KEY" # read the bunny docs for more details
CDN_STORAGE_NAME="MY_STORAGE" # read the bunny docs for more details
CDN_HOST="storage.bunnycdn.com" # where should we upload the pictures? read the bunny docs for more details
CDN_PUBLIC="https://cdn.veitag.app" # your cdn's url, used to create avatarURL & qrURL fields
```