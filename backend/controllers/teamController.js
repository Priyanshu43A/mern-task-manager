const mongoose = require('mongoose'); 
const Team = require('../models/Team');
const User = require('../models/User'); // Import the User model
const sendResponse = require('../utils/sendResponse'); // Import the sendResponse utility

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const boss = req.user.id;

    // Validate that the name does not contain special characters
    const nameValidation = /^[a-zA-Z0-9\s]*$/.test(name);
    if (!nameValidation) {
      return sendResponse(res, 400, false, 'Team name contains special characters!');
    }

    const newTeam = new Team({
      name,
      description, // Include description in the new team instance
      employees: [],
      boss,
      requests: []
    });

    await newTeam.save(); // Save the new team to the database

    // Push the new team ID to the boss's Admin array
    await User.findByIdAndUpdate(boss, { $push: { Admin: newTeam._id } });

    sendResponse(res, 201, true, "Team created successfully", { team: newTeam });
  } catch (error) {
    sendResponse(res, 500, false, 'Error creating team', {}, { error: error.message });
  }
};
 
const addEmployees = async (req, res) => {
    try {
        const { employeeIds, teamId } = req.body; // Extract employeeIds (array) and teamId from request body
        const bossId = req.user.id; // Get the boss ID from the request

        // Validate teamId format
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return sendResponse(res, 400, false, 'Invalid team ID format.');
        }

        // Check if employeeIds is an array and contains at least one ID
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return sendResponse(res, 400, false, "Please provide an array of employee IDs!");
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return sendResponse(res, 404, false, "Team not found!");
        }

        // Check if the boss belongs to the team
        if (team.boss.toString() !== bossId) {
            return sendResponse(res, 403, false, "You are not authorized to add employees to this team!");
        }

        const notFound = [];
        const alreadyInTeam = [];
        const addedEmployees = [];

        // Iterate over the employeeIds
        for (const employeeId of employeeIds) {
            // Validate employeeId format
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return sendResponse(res, 400, false, 'Invalid employee ID format.');
            }

            const user = await User.findById(employeeId);
            if (!user) {
                notFound.push(employeeId); // Track employees that are not found
                continue;
            }

            // Check if the boss is trying to add themselves
            if (bossId === employeeId) {
                return sendResponse(res, 400, false, 'Boss can\'t add themselves as employees');
            }

            // Check if the employee is already in the requests or employees arrays
            if (team.requests.includes(employeeId) || team.employees.includes(employeeId)) {
                alreadyInTeam.push(employeeId); // Track if already in team or requests
                continue;
            }

            // Add employee to the team's requests array
            team.requests.push(employeeId);
            addedEmployees.push(employeeId); // Track successfully added employees

            // Push the teamId to the user's requests array
            user.requests.push(teamId);
            await user.save(); // Save the updated user document
        }

        await team.save(); // Save the updated team with new requests

        // Formulate a detailed response message
        let message = `Employees requested to join ${team.name}.`;
        if (addedEmployees.length) message += ` Added: ${addedEmployees.length} employees.`;
        if (notFound.length) message += ` Not found: ${notFound.length} employees.`;
        if (alreadyInTeam.length) message += ` Already in team requests: ${alreadyInTeam.length} employees.`;

        sendResponse(res, 200, true, message, { addedEmployees, notFound, alreadyInTeam, team });
    } catch (error) {
        sendResponse(res, 500, false, 'Error adding employees', {}, { error: error.message });
    }
};


const removeEmployees = async (req, res) => {
    try {
        const { employeeIds, teamId } = req.body; // Extract employeeIds (array) and teamId from request body
        const bossId = req.user.id; // Get the boss ID from the request

        // Validate teamId format
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return sendResponse(res, 400, false, 'Invalid team ID format.');
        }

        // Check if employeeIds is an array and contains at least one ID
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return sendResponse(res, 400, false, "Please provide an array of employee IDs!");
        }

        // Remove duplicate employee IDs
        const uniqueEmployeeIds = [...new Set(employeeIds)];

        const team = await Team.findById(teamId);
        if (!team) {
            return sendResponse(res, 404, false, "Team not found!");
        }

        // Check if the boss belongs to the team
        if (team.boss.toString() !== bossId) {
            return sendResponse(res, 403, false, "You are not authorized to remove employees from this team!");
        }

        const notFound = [];
        const notInTeam = [];
        const removedEmployees = [];

        // Iterate over the unique employeeIds
        for (const employeeId of uniqueEmployeeIds) {
            // Validate employeeId format
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return sendResponse(res, 400, false, 'Invalid employee ID format.');
            }

            // Check if the employee is in the team
            if (!team.employees.includes(employeeId) && !team.requests.includes(employeeId)) {
                notInTeam.push(employeeId); // Track if the employee is not in the team or requests
                continue;
            }

            // Remove employee from the team's employees and requests arrays
            team.employees.pull(employeeId);
            team.requests.pull(employeeId);
            removedEmployees.push(employeeId); // Track successfully removed employees

            // Remove the teamId from the user's requests array
            const user = await User.findById(employeeId);
            if (user) {
                user.requests.pull(teamId); // Remove the teamId from user's requests
                await user.save(); // Save the updated user document
            }
        }

        await team.save(); // Save the updated team with new employees and requests

        // Formulate a detailed response message
        let message = `Employees removed from ${team.name}.`;
        if (removedEmployees.length) message += ` Removed: ${removedEmployees.length} employees.`;
        if (notInTeam.length) message += ` Not found in team or requests: ${notInTeam.length} employees.`;

        sendResponse(res, 200, true, message, { removedEmployees, notInTeam, team });
    } catch (error) {
        sendResponse(res, 500, false, 'Error removing employees', {}, { error: error.message });
    }
};



const getTeamDetails = async (req, res) => {
   try {
    const {teamId} = req.params;
     // Validate teamId format
     if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return sendResponse(res, 400, false, 'Invalid team ID format.');
    }

    const team = await Team.findById(teamId)
    .populate({
        path: 'boss',
        select: '-password -otp -authToken -Admin -Employee -BossTasks -EmployeeTasks' // Exclude sensitive fields
    })
    .populate({
        path: 'employees',
        select: '-password -otp -authToken -Admin -Employee -BossTasks -EmployeeTasks' // Exclude sensitive fields
    })
    .populate({
        path: 'requests',
        select: '-password -otp -authToken -Admin -Employee -BossTasks -EmployeeTasks' // Exclude sensitive fields
    });


    if (!team) {
      return sendResponse(res, 404, false, "Team not found!");
    }

    sendResponse(res, 200, true, { team } );


   } catch (error) {
    // console.log(error)
    sendResponse(res, 500, false, 'Error getting team details.', {}, { error: error.message });
    
   }
};

const acceptInvite = async (req, res) => {
    try {
        const { teamId } = req.body; // Extract teamId from request body
        const employeeId = req.user.id; // Get the employee ID from the request

        // Validate teamId format
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return sendResponse(res, 400, false, 'Invalid team ID format.');
        }

        // Find the team by ID
        const team = await Team.findById(teamId);
        if (!team) {
            return sendResponse(res, 404, false, "Team not found!");
        }

        // Check if the employee has a request to join the team
        if (!team.requests.includes(employeeId)) {
            return sendResponse(res, 403, false, "You don't have an invitation to this team!");
        }

        // Remove the employee from the team's requests
        team.requests = team.requests.filter(id => id.toString() !== employeeId);

        // Add the employee to the team's employees array
        team.employees.push(employeeId);

        // Find the user and update their requests
        const user = await User.findById(employeeId);
        if (user) {
            user.requests = user.requests.filter(id => id.toString() !== teamId); // Remove the teamId from user's requests
            await user.save(); // Save the updated user document
        }

        await team.save(); // Save the updated team document

        sendResponse(res, 200, true, "You have successfully accepted the invitation!", { team });
    } catch (error) {
        sendResponse(res, 500, false, 'Error accepting the invitation', {}, { error: error.message });
    }
};

module.exports = { createTeam, addEmployees, getTeamDetails, acceptInvite, removeEmployees };
