# About Us Module

### How to Add timeline Events

1. Find the file events.json 
> src/app/cube/about-us/componenets/timeline/events.json

2. Add Event
    - The format of a timeline event is:
        ```
        {
            "date": string,
            "description": string,
            "image": src path (optional)
        }
        ```
    - The events are organized by date, Top (Most Recent) - Bottom (Oldest)
    - There should be an image for every other event
    - Images should have transparent backgrounds and be placed in
    > src/assets/images

