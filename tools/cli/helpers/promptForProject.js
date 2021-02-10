/**
 * External dependencies
 */
import inquirer from 'inquirer';
import pluralize from 'pluralize';

/**
 * Internal dependencies
 */
import { dirs, projectTypes, allProjects, checkNameValid } from './projectHelpers';

/**
 * Prompt for project.
 *
 * If no project is passed via `options`, then it will prompt for the type of project and the project itself.
 *
 * @param {object} options - Passthrough of the argv object.
 *
 * @returns {object} argv object with the project property.
 */
export async function promptForProject( options ) {
	const questions = [];
	let typeAnswer;

	if ( ! options.project || options.project.length === 0 ) {
		typeAnswer = await promptForType();
		questions.push( {
			type: 'list',
			name: 'project',
			message: 'Please choose which project',
			choices: dirs( './projects/' + typeAnswer.type ),
		} );
	} else if ( ! allProjects().includes( options.project ) ) {
		return new Error( 'Must be an existing project.' );
	}

	const finalAnswers = await inquirer.prompt( questions );

	return {
		...options,
		project: options.project || typeAnswer.type + '/' + finalAnswers.project,
	};
}

/**
 * Prompt for Generating New Project.
 *
 * If no project is passed via `options`, then it will prompt for the type of project and the project itself.
 *
 * @param {object} options - Passthrough of the argv object.
 *
 * @returns {object} argv object with the project property.
 */
export async function promptForGenerate( options ) {
	let typeAnswer = options.type ? { type: options.type } : '';
	let nameAnswer;
	let tries = 0;

	// Get project type if not passed as an option.
	if ( ! typeAnswer || typeAnswer.length === 0 ) {
		typeAnswer = await promptForType();
	} else if ( ! projectTypes.includes( pluralize( typeAnswer.type ) ) ) {
		return new Error( 'Must be a valid project type' );
	}

	// Get the appropriate list of project prompts based on type
	const questions = getQuestions( options.type || typeAnswer.type );
	if ( ! questions ) {
		return new Error( "Sorry! That's not supported yet!" );
	}

	// Validate name if it was passed as an option.
	if ( options.name ) {
		nameAnswer = checkNameValid( typeAnswer.type, options.name ) ? options.name : null;
	}

	// Keep asking for name if it fails validation
	while ( ! nameAnswer ) {
		try {
			tries++;
			const rawNameAnswer = await promptForName();
			nameAnswer = checkNameValid( typeAnswer.type, rawNameAnswer ) ? rawNameAnswer : null;
		} catch ( err ) {
			if ( tries >= 3 ) {
				console.error( 'You are really struggling here. Might be time to take a walk.' );
				console.error( err.name + ': ' + err.message );
			}
		}
	}

	// Give the list of questions
	const finalAnswers = await inquirer.prompt( questions );

	return {
		...options,
		type: pluralize.singular( typeAnswer.type ),
		name: nameAnswer.name || options.name,
		n: nameAnswer.name || options.name,
		...finalAnswers,
	};
}

/**
 * Prompt for type.
 *
 * If no type is passed via `options`, then it will prompt for the type of project.
 *
 * @param {object} options - Passthrough of an object, meant to accept argv.
 *
 * @returns {object} object with the type property appended.
 */
export async function promptForType( options = { type: '' } ) {
	let typeAnswer;

	if ( ! options.type || options.type.length === 0 ) {
		typeAnswer = await inquirer.prompt( {
			type: 'list',
			name: 'type',
			message: 'What type of project are you working on today?',
			choices: projectTypes,
		} );
	} else if ( ! projectTypes.includes( options.type ) ) {
		return new Error( 'Must be an accepted project type.' );
	}

	return {
		...options,
		type: options.type || typeAnswer.type,
	};
}

/**
 * Prompt for new project name.
 *
 * If no name is passed via `options`, then it will prompt for the name of project.
 *
 * @param {object} options - Passthrough of an object, meant to accept argv.
 *
 * @returns {object} object with the name property appended.
 */
export async function promptForName( options = { name: '' } ) {
	let nameAnswer;

	if ( ! options.name || options.name.length === 0 ) {
		nameAnswer = await inquirer.prompt( {
			type: 'input',
			name: 'name',
			message: 'What is your project called?',
		} );
	}

	return {
		...options,
		name: options.name || nameAnswer.name,
	};
}

/**
 * Returns the appropriate list of questions.
 *
 * @param {string} type - The project type. Must be one of projectTypes
 *
 * @returns {Array} - Array of questions to ask.
 */
export function getQuestions( type ) {
	const packageQuestions = [
		{
			type: 'input',
			name: 'desc',
			message: 'Succinctly describe your package:',
		},
	];
	const pluginQuestions = '';
	const extensionQuestions = '';
	const githubQuestions = '';

	switch ( pluralize.singular( type ) ) {
		case 'plugin':
			return pluginQuestions;
		case 'package':
			return packageQuestions;
		case 'editor-extension':
			return extensionQuestions;
		case 'github-action':
			return githubQuestions;
	}
}
