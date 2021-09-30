###### (May 2021)

# Epoch

first I had to design a test article to be used inside of an article template ejs.
I wanted articles to be displayed in a specific way
so I chose some middleware suitable for my purpose

- markdown-it to wrap documents into HTML tags
- markdown-it-checkbox to wrap markdown checkboxes into HTML tags
- highlight-js to wrap javascript codeblocks into HTML/CSS tags

Content of an article is transferred to template as a string
template displays string as HTML

Custom CSS is used to define how the markup is displayed to the end user


###Sources
https://www.youtube.com/watch?v=6FOq4cUdH8k

markdown is stored in MongoDB as an "Article" which is built:
- Article
- - headerImgUrl
- - title
- - subject
- - markdown
- - otherTitles (So that I can get express to redirect if the article title changes)