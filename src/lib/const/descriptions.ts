export const GeneralReportDescriptionTool = `specifically with the changes of each file in the propertie "patch" and with the "commitMessage" you will generate a report of changes base on the requirements on the client and the difined structure be detailed and comprehensive. 
    The reports has to have the following structure: 

    **CHANGELOG :rocket: #UPDATE {UPDATE NUMBER}**

    'A list of changes made in the last update, including new features, bug fixes, and improvements. Each change should be described in detail if the task is to big you can use more than one line with 100 characters each. The list should be formatted as follows:'
    (task number one and so on is not necesary add a number here):white_check_mark: {DESCRIPTION IN UPPERCASE IN SPANISH OF THE COMMIT MESSAGE} (a jump of line here)
     (three spaces here) * {HERE WILL BE A DESCRIPTION OF THE CHANGED FILES IN UPPERCASE IN SPANISH, IS LIKE A SUB-TASK FROM THE ORIGINAL COMMIT AND REPRESENT WHAT CHANGES WERE MADE IN EACH FILE RELATED TO THE COMMIT MESSAGE} (a jump of line here)
     (three spaces here) * {HERE WILL BE A DESCRIPTION OF THE CHANGED FILES IN UPPERCASE IN SPANISH, IS LIKE A SUB-TASK FROM THE ORIGINAL COMMIT AND REPRESENT WHAT CHANGES WERE MADE IN EACH FILE RELATED TO THE COMMIT MESSAGE} (a jump of line here)

    `
