# fixing playtime.json
a reference for when i forget

- vintt makes a playtime.json to track playtimes in minutes. at the time of this writing, its an object with the keys as the executable name and the values as the MINUTES played
- for dumb reasons the json has gotten obliterated a few times. but the **ttrack.log** file is always right...hopefully
- its not always right at all. so we have this tool to help us figure out if it has too many problems

## using it
- its in a js file. just pop it in the browser
- it takes a string which is supposed to be the whole log file. copy it in, give it to the function
- boom, results. first, check the enter and exit points
- ideally, since vintt should make an entry for each time a program starts and each time a program ends, the enter and exit numbers should be the same. but thats never the case.
    - luckily, having too many entrys is not a problem because the tool ignores entries withuot exits, simply taking the later entry. but if YOU the USER want to fix that, go into the log file and add exits for the estranged enters.
    - if there are more exits than enters, well, we have a problem. it means a certain exe is going to get way more hours than it should have, and you should definitely try fixing this possibly by removing the bad exit point. HOPEFULLY the tool ignores the bad exit and continues but who knows
- but you dont really have to check these numbers. there are warnings showing where bad things happen
    - from what ive gathered, ignoring these warnings essentially reduces the amount of recorded playtime of a tracked program because it ignores sessions, so its not that bad
- if youre happy with the output despite the glaring warnings, go ahead and copy the output json and replace playtime.json