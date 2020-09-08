+++
title = "GRCD2015"
description = "Showcasing soon-to-be grads and their capstone projects at DAAP's annual senior show."
year = "2015"
season = "spring"
technologies = [
  "AngularJS",
  "Node.js",
  "Mongoose",
  "MongoDB",
  "Python",
  "Amazon EC2"
]
repository = "https://github.com/MichaelZalla/GRCD2015-Website"
hasDemo = true
swatch = "#0E3C14"
+++

A student’s final semester in DAAP revolves largely around DAAPworks, the college's annual, week-long senior exhibit. Open to the public, DAAPworks invites friends, family, and press in to explore senior capstone projects across a variety of disciplines, including print design, motion and interaction design, industrial and product design, architecture, and fashion, to name a few. {{< read-more-button >}}

Groups of students in each discipline (or "focus") are tasked with preparing certain elements of the show, including branding, web and social presence, wayfinding, setup, and teardown.

As a Graphic Communication Design major and a member of the Interaction Design focus, I worked on a team to ideate, design, prototype, and build a website that would showcase the capstone projects of the roughly 90 seniors represented in Graphic Communication Design. We collaborated with a branding team—represented by several students from the Print focus—to faithfully translate the show's visual brand identity to the web. We also worked with a Motion design team to bring a teaser video to the site.

My personal contributions to the project included the development of the final website—a single-page AngularJS application, released to the public in 3 stages leading up to the show. I also contributed ideations for possible design directions and participated in team discussions to explore how we could organize student and project information in a way that was easy to navigate.

The final site builds were hosted on an Amazon EC2 instance and made public at [grcd2015.com](http://grcd2015.com).

Early on in the project, I also experimented with building a data collection system using Node.js, Mongoose, and a mongodb database. A student would use a web frontend to enter structured information about themselves and their capstone project, and the information would be passed to a web API and stored in the database; later on, all data could be exported as JSON documents to power the final website. I used Python and urllib2 to generate placeholder student and project records and submitted them to a Node.js Express server endpoint, where the data was added to the database. Due to time constraints leading up to the show, this approach was scrapped in favor of using Google Sheets and validating the submitted data by hand.
