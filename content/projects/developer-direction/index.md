+++
title = "Developer Direction"
description = ""
year = "2021"
season = "summer"
technologies = [
	"Sketch",
	"Hugo",
	"Sass",
	"OpenGraph",
	"Amazon S3, CloudFront, and Route53",
	"Amazon AWS CLI",
	"MailChimp forms",
	"PayPal Payment API",
	"Google Analytics",
]
repository = "https://github.com/Jpcostan/developer-direction-web/"
hasDemo = false
swatch = "#C02E33"
draft = false
+++

Developer Direction is a professional education network created to help students expand their technical abilities while learning how to navigate the ever-changing fields of software development and IT. Members of the network can enroll to take part in live, virtual courses on topics including web development, object-oriented programming, and blockchain. {{< read-more-button >}}

Through its platform and dedicated community, [Developer Direction](https://www.developerdirection.com) has helped many students make their professional entrances into the tech industry—securing new roles as software developers, data scientists, and business analysts. Community values emphasize personal responsibility, collaboration, and goal-setting. Students are guided through the process of developing their own programming projects and personal portfolio website—even if they are completely new to coding.

The process builds the student's own confidence in industry-relevant skills while establishing a professional online presence. Students are also expected to share concrete goals for which they can be held accountable; these can include résumé revisions, job application quotas, or simply polishing a LinkedIn profile.

I worked directly with Josh, founder of Developer Direction, to produce a new website and online course catalog. The initial website was designed and built in a 24-hour period, just before it was presented over Zoom to an audience of hundreds of potential students.

Initial mockups were made in Sketch. The homepage is designed to give viewers a quick, clear understanding of what Developer Direction is, and what it offers for existing and prospective tech professionals. The course product page is designed to accommodate multiple course types, including live (Zoom) and pre-recorded (video). License-free images and background visuals were sourced from [Unsplash.com](https://unsplash.com).

The website was developed using [Hugo](https://gohugo.io), a fast, flexible static site generator written in Go. Course descriptions and metadata are defined in markdown files and used to generate complete webpages. Mailchimp integration allows users to join the email list and be notified of new, upcoming courses. PayPal integration allows users to purchase access to a course directly on the site. Google Analytics gives Developer Direction's staff a clearer picture of who is visiting the site, and from where.

The live site is hosted as an Amazon AWS CloudFront distribution backed by an S3 bucket.
