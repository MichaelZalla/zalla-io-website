const buttons = Array.from(
	window.document.body.querySelectorAll('.article-social-share-links .social-share-link')
);

buttons.map((button) => {
	button.addEventListener('click', onDidClickSocialShareLink);
});

function openUrlInWindow(
	url)
{
	window.open(url, '_blank', 'width=640,height=480,left=36,top=36');
}

function onDidClickSocialShareLink(e)
{

	const articleMetadata = e.currentTarget.parentElement.parentElement.dataset;

	const shareMethod = e.currentTarget.dataset.shareMethod;

	const url = encodeURIComponent(window.location.href.replace(/#$/g, ''));

	const title = articleMetadata.articleTitle;

	const tags = articleMetadata.articleTags
		.replace(/[\[\]]/g, '')
		.split(' ')
		.map((tag) => `#${tag}`)
		.join(' ');

	const text = encodeURIComponent(`${title} ${tags}`);

	switch(shareMethod)
	{
		case 'facebook':

			openUrlInWindow(`https://www.facebook.com/sharer.php?u=${url}`);

			break;

		case 'linkedin':

			openUrlInWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);

			break;

		case 'twitter':

			openUrlInWindow(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);

			break;

		// case 'link':

		// 	// Copy current page URL to clipboard

		// 	break;

		default:

			// Do nothing

			break;

	}

}
