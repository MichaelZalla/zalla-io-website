+++
title = "Bearcat Barcrawl"
description = "Crawl like a man. Drink like a Bearcat."
year = "2014"
season = "fall"
technologies = [
  "Node.js",
  "Express",
  "AngularJS",
  "Google Maps API",
  "Google Maps TSP Solver"
]
repository = ""
swatch = "#6E161E"
+++

Bearcat Barcrawl is a web and native mobile app that was created during RevolutionUC, a 24-hour hackathon organized by students from the University of Cincinnati in 2014. {{< read-more-button >}}

Bearcat Barcrawl is designed to improve your bar-crawling experience by connecting well-rated and nearby bars, pubs, and other late-night establishments along an optimal walking path. Users can enter their location—or have this entered automatically by authorizing location-sharing services—and generate a new crawl.

I worked on a team with 3 other hackers to brainstorm ideas for a hack; once we had decided on a bar-crawl app, we turned our attention to the design of the user experience as well as the technical implementation that would make our app possible.

For my own contribution, I covered most of the application programming for the web frontend. I used AngularJS to scaffold out a dashboard view, writing AngularJS services to wrap calls to the various Google Maps and Google Places APIs to retrieve location-based data.