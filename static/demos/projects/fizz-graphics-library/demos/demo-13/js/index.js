$(() => {

	const canvas = document.getElementById('canvas');

	var fontsheet = new Fizz.Fontsheet({
		source: './assets/fontsheet.png',
		fontName: 'Retro Font',
		glyphSet: {
			width: 86,
			height: 140,
			values: ' !\'#$%&"()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmnopqrstuvwxyz{|}~',
		}
	});

	fontsheet.addEventListener('load', function() {

		var initMessage = 'Start typing!';

		initMessage.split('').map(function(glyph) {

			var glyphCache = fontsheet.getGlyph(glyph);

			var clone = new Fizz.Canvas(glyphCache).splice();
				clone.setAttribute('data-character', glyph);

			canvas.appendChild(clone);

		});

	});

	document.body.addEventListener('keydown', function(e) {

		if(8 === e.keyCode)
		{

			e.preventDefault();

			var len = canvas.children.length;

			if(canvas.children.length)
			{
				canvas.removeChild(canvas.children[len-1]);
			}

		}
	});

	document.body.addEventListener('keypress', function(e) {

		if(!fontsheet.loaded)
		{
			return;
		}

		var glyph = String.fromCharCode(e.keyCode);

		var glyphCache = fontsheet.getGlyph(glyph);

		var clone = new Fizz.Canvas(glyphCache).splice();
			clone.setAttribute('data-character', glyph);

		canvas.appendChild(clone);

	});

});
