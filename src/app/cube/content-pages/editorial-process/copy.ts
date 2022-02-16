export const sections = {
	process: {
		title: 'Editorial Process',
		topics: [
			{
				title: 'Curriculum Evaluation',
				questions: [
					{
						question: 'Why must my curriculum be evaluated?',
						answer: 'All types of curricula must be evaluated for quality assurance. An evaluation is needed to ensure that ' +
                        'all curricula released on CLARK contain no issues with any of the characteristics mentioned above. Since all ' +
                        'released curricula fall under Creative Commons, it is necessary to ensure all content is of the best quality ' +
                        'possible.'
					},
					{
						question: 'How is the curriculum evaluated?',
						answer: [
                            `
                            <p>
                            All curriculum goes through an evaluation process that reviews a curriculum\'s required characteristics. 
                            These characteristics act as the evaluated criteria for the editorial process:
                            </p>
                            <ul>
                                <li>Proper contributor attribution.</li>
                                <li>Writing style, grammar, punctuation, and capitalization.</li>
                                <li>Accessibility under WCAG 2.1 AA standards.</li>
                                <li>If the curriculum\'s content can be understood by its intended audience.</li>
                                <li>Consistent formatting of curriculum content.</li>
                            </ul>
                            <p>
                                Relevant learning outcomes are present. Some curricula will have conditional evaluations (if provided) 
                                over these characteristics:
                            </p>
                            <ul>
                                <li>Documentation of a provided syllabus.</li>
                                <li>The curriculum is part of a learning object hierarchy with proper parent-child relationships.</li>
                                <li>Provided assessment questions do not include solutions (CLARK is a public website that all types of 
                                    audiences can access).</li>
                            </ul>
                            `
                        ]
					},
					{
						question: 'The Editorial Review Process',
						answer: 'The editorial review process is a multi-week evaluation done by CLARK\'s editorial team to review ' +
                        'submitted curricula. Curricula are reviewed and documented for any potential issues that require fixes. ' +
                        'The editorial team will fix any minor problems such as typos, grammar, punctuation, formatting, and ' +
                        'alternative text for imagery during the process. The editorial team will also provide any needed ' +
                        'documentation to the author of major problems that require fixes from the author\'s side, such as missing ' +
                        'files and incomplete curricula. The editorial team will never majorly alter content, such as removing ' +
                        'text, files, or imagery. Any changes made by the editorial team are quality of life changes to provide ' +
                        'the authors less needed work.'
					},
					{
						question: 'Learning Object Statuses',
						answer:[
                            `
                        <p>
                        Every curriculum submitted becomes a learning object and will have a designated status in the
                        editorial review process. Statuses allow an author to track where a learning object is currently in
                        the process or if it was already released. \nA learning object can have the following statuses:</p>
                        <ul>
                            <li>Draft Learning Objects: Unsubmitted learning objects.</li>
                            <li>Waiting: Submitted learning objects that have yet to be reviewed.</li>
                            <li>Review: Learning objects that are currently being reviewed.</li>
                            <li>Accepted Minor Changes: Learning objects that could be accepted after the author applies 
                                minor changes.</li>
                            <li>Accepted Major Changes: Learning objects that could be accepted after the author applies major
                                 changes.</li>
                            <li>Proofing: Learning objects that are being prepped for release with small quality of life changes made 
                                by the editorial team.</li>
                            <li>Released: Learning objects that have been approved and are now publicly available on CLARK. </li>
                            <li>Rejected: Learning objects that are deemed not releasable on CLARK.</li>
                        </ul>
                            `
                        ]
					},
					{
						question: 'How long is the Editorial Review Process?',
						answer: 'Depending on the learning object size and quantity, the editorial review process ' +
                        'is estimated to take two to four weeks. Throughout the process, the author is communicated ' +
                        'with for any needed feedback of a submitted object. '
					}
				],
            },
            {
				title: 'The Curriculum Development Lifecycle',
				questions:[
					{
						question: 'What is the Curriculum Development Lifecycle?',
						answer: [
                            `
                                <p>The curriculum development lifecycle is the multi-stage sequence of any submitted learning object.
                                Each stage is based on a learning object status and the routes a learning object can take. The curriculum
                                development lifecycle aims to provide a physical representation of a learning object on CLARK. The diagram
                                below demonstrates how the lifecycle operates.</p>
                                <img src='../../../../assets/images/editorial-process-lifecycle.png' width='100%'>
                                `
                        ]
					},
					{
						question: 'Why was my learning object rejected?',
						answer: 'A learning object was rejected as it did not meet the criteria requirements found under the "How ' +
                        'Curriculum is Evaluated" above. The author is provided specific reasoning for rejection and encouraged to' +
                        'resubmit later on with an improved or new learning object.'
					},
					{
						question: 'What is the difference between acceptance minor and acceptance major?',
						answer:[
                            `
                        <p>
                        Both statuses require action from the author as there are changes that the editorial team cannot
                        make. The main differences in statuses are provided below: 
                        </p>
                        <ul>
                            <li>Accepted Major</li>
                            <ul>
                                <li>A learning object is missing files.</li>
                                <li>A learning object video does not have captioning.</li>
                                <li>A learning object lacks proper contributor attribution.</li>
                                <li>A learning object file has an incomplete paragraph or section.</li>
                                <li>A learning object contains some outdated curriculum.</li>
                            </ul>
                            <li>Accepted Minor</li>
                            <ul>
                                <li>A learning object contains assessment solutions.</li>
                                <li>A learning object has a color contrast issue.</li>
                                <li>A learning object was submitted to the wrong collection.</li>
                                <li>A learning object is under the wrong learning object length.</li>
                            </ul>
                        </ul>
                            `
                        ]
					},
					{
						question: 'What is the difference for an object to be in \'Review\' and \'Proofing\'?',
						answer: 'A learning object going through a review status is only being evaluated and documented on any ' +
                        'potential problems. On the other hand, a learning object going through a proofing status has small fixes ' +
                        'applied to minor issues such as typos, grammar, punctuation, formatting, and alternative text for imagery. ' +
                        'Typically, a proofing status is near the end of the review lifecycle, while a review status is at the start.'
					},
					{
						question: 'Can I make changes to my Learning Object after it was accepted?',
						answer: 'Yes, an author can make any changes to their released learning object through revisions. A revision ' +
                        'allows an author to see and edit their current learning object version in the learning object builder. The ' +
                        'author is free to add, replace, and remove varying content. When an author finishes a revision, the ' +
                        'learning object is resubmitted and goes through the curriculum development lifecycle.'
					}
                ]
            }
        ]
    }
};
