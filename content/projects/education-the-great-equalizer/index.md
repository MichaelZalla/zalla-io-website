+++
title = "Education: The Great Equalizer"
description = "Harnessing existing data to draw meaningful correlations"
year = "2013"
season = "fall"
technologies = [
  "Python",
  "Python xlrd Module",
  "JavaScript",
  "D3.js"
]
swatch = "#033519"
hasDemo = true
+++

At the 2012 Goldman Sachs Technology and Internet Conference, Apple's CEO Tim Cook led a keynote presentation in which he stated the following: _"We believe that education is the great equalizer, and that if people are provided with the skills and knowledge, they can improve their lives."_ {{< read-more-button >}}

In 2012, there were nearly [150 countries](https://www.google.com/#q=2012+World+Economic+Outlook+Report) that were still considered to be 'developing' or 'under-developed'. Inspired by Tim's words, I created a set of interactive visualizations that explore to what degree increased educational opportunities for women result in later childbearing, fewer children, and longer life expectancies for family members.

This interactive piece allows users to visually explore global trends in population growth, lifespan, maternity, and education, and—from this data—draw meaningful correlations between eighteen countries from around the world. The visualization was developed using the powerful D3.js library.

The datasets used by the visualization were provided by the United Nations [Department of Economic and Social Affairs](https://www.un.org/development/desa/en/), as well as by the UNESCO [Institute for Statistics Data Centre](http://uis.unesco.org/). One bi-product of this project is my [XLSReader class](https://github.com/MichaelZalla/XLSReader), a wrapper class for the popular [xlrd](https://pypi.python.org/pypi/xlrd/0.9.3) Python module; using this class in my Python scripts made it possible to iteratively refine a single dataset from a collection of very large datasets stored in .xls files.

For a deeper understanding of these issues, and of the project's development, check out the {{< href "attachments/*" "process book!" >}}
