let menu = document.querySelector('.menu');
let navigation = document.querySelector('.navigation');

function toggle() {
	if (navigation.classList[1] == 'hidden') {
		navigation.classList.remove('hidden');
		navigation.classList.add('visible');
	} else {
		navigation.classList.add('hidden');
		navigation.classList.remove('visible');
	}
}

menu.addEventListener('click', toggle);