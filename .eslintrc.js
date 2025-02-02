module.exports = {
	root: true,

	ignorePatterns: [ '*.js' ],

	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],

	rules: {
		'@typescript-eslint/no-explicit-any': [
			'warn'
		]
	}
}
