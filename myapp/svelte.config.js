// import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: '../view/build',
			assets: '../view/build',
			fallback: '200.html',
			precompress: false,
			strict: true
		})
	}
};

