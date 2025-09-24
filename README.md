# Local quizz app

An application that allows the user to play a quizz locally in the browser:

- [x] The quizz would be accessible via an URL like https://quizz.com?q=[b64-encoded-json-of-the-quizz]
- [x] When accessing the URL, the user would see the title, optional thumbnail and description of the quizz, and a button to start the quizz
- [x] After clicking the button, the user would see the questions one by one, with possible answers to choose from (depending on the question type)
- [x] At the end of the quizz, the user would see their score and a button to copy the results as a formatted, shareable text

## Editor mode

As a quizz creator, I want to be able to create and edit quizz in a user-friendly way:

- [x] The quizz editor would be accessible via an URL like https://quizz.com/editor
- [x] The editor would allow the user to input the title, optional thumbnail and description of the quizz, and also other basic configurations (see types.ts for Quizz type)
- [x] The editor would allow the user to add, edit and delete questions, with support for different question types (see types.ts for different Question types)
- [x] The editor would allow the user to reorder questions via up/down buttons
- [x] The editor would allow the user to export the quizz as a base64-encoded JSON string, to be used in the URL
- [x] Bonus: The editor would generate a QR code for the quizz URL, to easily share it with others
- [x] The editor would allow the user to import a base64-encoded JSON string to load an existing quizz for editing
- [x] Bonus: The editor would allow the user to save and load quizz from local storage, to avoid losing progress when navigating away from the page
