+++
slug = "{{ .Name }}"
title = "{{ replace .Name '-' ' ' | title }}"
description = ""
byline = ""
year = "{{ now.Format '2006' }}"
season = ""
swatch = "#999999"
repository = ""
hasDemo = true
demo_url = ""
disqus_identifier = "{{ .Site.DisqusShortname }}-{{ .Name }}"
disqus_title = "{{ replace .Name '-' ' ' | title }}"
draft = true
+++

**Insert project description here.**
