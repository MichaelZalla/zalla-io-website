+++
title = "zalla.io"
description = "The personal website of Michael Zalla."
year = "2018"
season = "spring"
technologies = [
	"Sketch",
	"Hugo",
	"Sass",
	"JavaScript",
	"git LFS",
	"OpenGraph",
	"Amazon S3, CloudFront, and Route53",
	"Amazon AWS CLI",
	"Google Analytics",
	"Disqus",
]
repository = "https://github.com/MichaelZalla/zalla-io-website"
hasDemo = false
swatch = "#9B231C"
draft = false
+++

Rebirth. Resurrection. Regrowth. The spring season instills in many of us these feelings, and I am no exception. In the spring of 2018 I could feel a growing itch for a new personal project, coupled with a desire to commit to some digital "spring cleaning". {{< read-more-button >}}

No better time, then, to turn my attention to my own portfolio website—and consider how I might re-envision it for the modern web. The web is a moving target, and making the most of its development tools requires diligent attention and a willingness to try new things.

Years earlier, in 2014, I had designed and developed the first iteration of [zalla.io](/)—a new personal website to showcase my projects for school and fun. <!--The design was informed, in part, by the 3 or 4 previous manifestations of my portfolio site, dating back to 2011. -->This iteration, in part, helped me land an internship with [The Brandery](https://www.brandery.org), a local startup accelerator and non-profit. Despite these early dividends, the site had plenty of room left for improvement, both in the user experience and developer experience arenas.

At the time, the website suffered from several issues, including:

- A lack of separation between content and supporting presentation.
- Duplication of common markup structures across individual webpages.
- A lack of efficient distribution, leaving users with suboptimal load-times.
- A poor mobile browsing experience.

To address these issues, among others, I set out to define some success criteria for the new design:

- **Simple.** The process of adding new projects and updating content should not require complete knowledge of how the site is built. Page designs should accommodate fully-dynamic content while still offering a unique and consistent experience.
- **Fast.** Content should reach users quickly—especially considering the evergreen nature of most online portfolios. Off-screen content should not block the initial display of content on a page.
- **Responsive.** For each page on the site, attention should be given to the mobile and tablet experience. Page designs should accommodate an array of viewports without requiring extensive customizations.
<!-- - **Discoverable.**  -->
- **Automated.** A new build or production deployment should be as simple as running a single command.

With these new directives, I got to work in Sketch.

I quickly realized that mobile portfolio design can pose a particular challenge: designers and developers often need to present highly visual (i.e., image-heavy) content in order to exhibit the final product and to illustrate their original directions and process; at the same time, design systems and digital products require creators to make a considerable number of choices—choices that are worth some thoughtful, written context. The limited screen-space inherent to mobile means that only so much visual and written content can occpy the screen at any given time—so how do you balance this?

This was the primary question driving my explorations in Sketch. For users mainly interested in enjoying the visuals, how do you prevent written content from pushing your visuals so far down the page that they're no longer apparent? For users who seek to gain concrete context through the creator's written remarks, how do you prevent the opposite?

Three possible approaches came to mind:

- First, a project's written remarks could be interwoven with the imagery—resulting in a highly curated presentation style wherein prose and visuals closely support each other—similar to a children's book.
- Second, a layout could accommodate 2 distinct containers—one for written content and another for images; a user would navigate (scroll) each container independently, allowing them to explore words and images independently at their own pace.
- Third, a page could present a preview of each medium—word and image—with navigation allowing users to quickly jump from one to the other.

I explored each strategy in Sketch to understand its relative merits. Focusing first on the experience of actually viewing a project, I considered what information would be key to include above-the-fold; a user's first glance at a mobile webpage is critical to helping them understand what content is being offered. It was important for the site's main navigation to be readily available—no matter how far down a page a user has wandered. Similarly, some sort of wayfinding affordance would be needed so that users could always tell what project they were currently viewing.

With mobile's limited screen space, it was necessary for each project's written description and visuals to stack vertically. I felt it was important, however, that some amount of both words and images be visible above-the-fold—so that a user would not need to scroll excessively just to access the written description or the visuals. For projects with longer descriptions, this could even become a problem on larger desktop screens.

My working solution followed the third approach described above: present just enough of a project's description to signal to users that more context was available, should they be interested. Project visuals would immediately follow, so that the first image or video would still get a share of the screen above-the-fold. The user could immediately choose to either (a) expand the written preview by clicking a "Read more…" button, or (b) continue scrolling the page to view images and other media. This approach worked well across all devices.

Design and coding took place in parallel as the site evolved. To meet the aforementioned success criteria, I needed a toolchain that would allow managed content to live separately from any presentation or implementation artifacts. I chose [Hugo](https://gohugo.io/)—a fast, flexible static site generator written in Go. The evergreen nature of my portfolio meant that content updates would be infrequent; as long as the process of regenerating the website was dead-simple, it would still be manageable to do so for each site update.

Hugo allowed me to define my project descriptions, captions, and metadata in Markdown, using a file organization that matched the resulting website. Hugo's templating language, combined with its concept of *taxonomies*, made it easy to define the *list-* and *detail-* view templates for any collection of content (in this case, *projects*). Hugo's *shortcode* feature allowed me to define custom web components to place directly in my Markdown. Partials were used to define common webpage elements, like the footer, in a single place. Hugo's *theme* feature allowed me to isolate some of the site's more general structures and styles (including a CSS grid system) inside a standalone theme, named Stroodle.

One of my custom shortcodes, *\<imgset\>*, allows the caller to render a group of project images together based on a common pattern in their filenames; the caller may also specify a text caption for the group, as well as a set of CSS classes to apply to the group container. For a site with over 1,500 managed images, this was quite convenient, as it allowed me to succinctly express, in Markdown, how a project's images should be ordered and organized—while also specifying the desired column-width of the images in a group. The shortcode is also responsible for lazy-loading, as well as dynamic selection of image source based on the device's pixel-ratio.

Images for each project were laid out in Sketch and then exported at multiple resolutions. While painstaking, this process mitigated inconsistency across hundreds of source images while also forcing me to consider the overall presentation of each project. Sketch was also used to prepare and export the projects' gallery thumbnails (as seen on the [Projects](/projects/) page as well as on OpenGraph).

Website changes are tracked in a git repository, with git *Large File Storage* (LFS) used to track changes to larger media files like JPG, PNG, and PDF. New builds can be executed by the *hugo* CLI via *npm* scripts. In keeping with the goals of simplicity and automation, I also added scripts to deploy all or some of the latest build to Amazon S3; both QA and production buckets can be targeted.

The website's integrations include Google Analytics and Disqus; viewers can leave comments on particular projects they find noteworthy. Xcode's iOS Simulator was helpful during development and testing, as it allowed me to casually track the site's behavior across a panel of (virtual) mobile devices. Google's PageSpeed Insights helped me to further optimize the site—ultimately reaching perfect or near-perfect scores on their dashboard.
