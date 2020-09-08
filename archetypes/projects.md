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
disqus_identifier = "{{ .Site.DisqusShortname }}-{{ .Name }}"
disqus_title = "{{ replace .Name '-' ' ' | title }}"
draft = true
+++

**Insert project description here.**
