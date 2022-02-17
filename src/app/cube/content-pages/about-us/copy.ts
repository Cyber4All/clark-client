export const sections = {
    about: {
        title: 'About Us',
        topics: [
            {
                title: 'About Us',
                questions: [
                    {
                        question: 'What is CLARK?',
                        answer: 'CLARK, the Cybersecurity Labs and Resource Knowledge-base, is a platform for building and sharing free ' +
                            'cybersecurity curricula. It includes a model for building curriculum, the digital library system, and ' +
                            'distinct curriculum collections.'
                    },
                    {
                        question: 'Who is CLARK for?',
                        answer: 'CLARK is for cybersecurity faculty and general users wanting to prepare for the next cybersecurity ' +
                            'workforce. The range of academic levels that can be taught through CLARK goes from K - 12 to all of ' +
                            'higher academia along with industry training. CLARK focuses on two main users: consumers and contributors. ' +
                            '<br><br> Consumers are registered users who want to download any content on CLARK. <br><br> Contributors ' +
                            'are registered users who want to provide their curriculum to CLARK for consumers to download.'
                    },
                    {
                        question: 'The History of CLARK',
                        answer: 'CLARK originally started development on Labor Day in 2017 and has continued to see new system ' +
                            'enhancements with a growing set of collections and learning objects. For more information on the CLARK ' +
                            'timeline, please see <a href= "https://clark.center/about">https://clark.center/about</a>.'
                    },
                    {
                        question: 'What is the Mission of CLARK?',
                        answer: 'CLARK aims to secure the nation through education. Our platform provides cybersecurity educators with ' +
                            'a high-quality and high-availability repository for curricular resources for the cybersecurity education ' +
                            'community. It provides cybersecurity educators with the building blocks to train the next wave of ' +
                            'researchers and better prepare the cybersecurity workforce.'
                    },
                    {
                        question: 'The Philosophy of CLARK',
                        answer: 'CLARK has five main philosophies that represent its content. These philosophies are: ',
                        philosophy: true,
                    }
                ]
            }

        ]
    },
    elements: {
        title: 'Elements of CLARK',
        topics: [
            {
                title: 'Learning Objects',
                questions: [
                    {
                        question: 'What is a learning object?',
                        answer: 'A <em>learning object</em> is a free piece of curriculum that is used to teach cyber and cyber-related ' +
                            'material in varying types of classrooms. Every learning object is created by a registered CLARK author. ' +
                            'Learning objects represent the main content found on CLARK.'
                    },
                    {
                        question: 'How does a learning object work?',
                        answer: 'A learning object is made up of different components. Each learning object will have a description ' +
                            'of the curriculum along with learning outcomes, academic levels, and materials related to the learning ' +
                            'object. All registered CLARK authors are able to download the learning object files (some learning objects ' +
                            'might be URL link-based only). All registered authors can also save learning objects to their personalized ' +
                            'CLARK library.'
                    }
                ]
            },
            {
                title: 'Collections',
                questions: [
                    {
                        question: 'What is a collection?',
                        answer: 'A collection is a group of learning objects that are categorized by different communities and ' +
                            'initiatives. Collections are determined based on their own unique processes such as peer review and ' +
                            'community guidelines for learning object materials.'
                    },
                    {
                        question: 'What is the connection between a learning object and a collection?',
                        answer: 'A learning object is a piece of curriculum grouped into a collection and a collection determines  ' +
                            'where a learning object will be placed. A learning object cannot exist on CLARK without being part of a collection'
                    }
                ]
            },
            {
                title: 'Hierarchies',
                questions: [
                    {
                        question: 'What is a hierarchy?',
                        answer: 'A <em>hierarchy</em> is a set of learning objects that are related to each other in a child to parent ' +
                            'relationship. When an author downloads from a parent learning object, the download will include all of the ' +
                            'parent’s learning object children’s material. The hierarchy process is based on a learning object’s length ' +
                            'and the interconnection of an author’s set of learning objects. The hierarchy goes as follows:<br><br>' +
                            'Course > Unit > Module > Micromodule > Nanomodule. <br><br><div display="block" justify-content="center">' +
                            '<img src="../assets/images/contentPages/Hierarchies.png" class= "clark-hierarchies" ' +
                            'alt="CLARK Hierarchies"> </div><br><br>A course is the highest learning object length while a nanomodule ' +
                            'is the shortest.'
                    },
                    {
                        question: 'Are all learning objects in a hierarchy?',
                        answer: 'Nope! A learning object can be by itself or represented within a hierarchy. It is more likely to see a ' +
                            'hierarchy within a course learning object that is broken down by modules or units and broken further down ' +
                            'into micromodules and nanomodules.'
                    }
                ]
            },
            {
                title: 'Searching & Downloading on CLARK',
                questions: [
                    {
                        question: 'How to get started',
                        answer: '<p> Anyone can search for a learning object on CLARK through the search bar or filter ' +
                            'function. However, you must register an account to preview and download any learning object material. We ' +
                            'have a great tutorial that can guide you step by step on searching and downloading here, ' +
                            '<a href= "https://youtu.be/ymerRpfbnQQ">https://youtu.be/ymerRpfbnQQ</a>.',
                        video: true
                    },
                ]
            },
        ]
    }
};
