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

	const shareMethod = e.currentTarget.dataset.shareMethod;

	switch(shareMethod)
	{
		case 'facebook':

			openUrlInWindow(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(window.location)}`);

			break;

		case 'linkedin':

			openUrlInWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location)}`);

			break;

		case 'twitter':

			openUrlInWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location)}`);

			break;

		// case 'link':

		// 	// Copy current page URL to clipboard

		// 	break;

		default:

			// Do nothing

			break;

	}

}
