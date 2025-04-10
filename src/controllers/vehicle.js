"use strict";
const { User, Vehicle } = require('../models')

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'List All Vehicles'
        #swagger.description = `You can send query with endpoint for search[], sort[], page and limit.
          <ul> Examples:
              <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
              <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
              <li>URL/?<b>page=2&limit=1</b></li>
          </ul>
        `
        #swagger.parameters['showDeleted'] = {
        in: 'query',
        type: 'boolean',
        description:'Send true to show deleted data as well, default value is false'
      }
     */
    const data = await req.getModelList(Vehicle, {}, [
      {
        model: User,
        as: 'driver',
        attributes: ["firstName", "lastName"],
      },
    ]);
    res.status(200).send({
      details: await req.getModelListDetails(Vehicle),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Vehicle: Create'
        #swagger.description = 'Create with DriverID, plateNumber, model and capacity'
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            "DriverId": "number",
            "plateNumber": "string",
            "model": "number",
            "capacity": "number"
          }
        }
     */
    req.body.creatorId = req.user.id;
    const data = await Vehicle.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Read Vehicle with id'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const data = await Vehicle.findByPk(req.params.id);
    if (!data) throw new Error("Vehicle not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Update vehicle with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>Send the object includes attributes that should be updated.</li>
              <li>You can update: DriverId, plateNumber, capacity and model .</li>
            </ul> ',
          required: true,
          schema: {
            "DriverId": "number",
            "plateNumber": "string",
            "model": "number",
            "capacity": "number",
            "status":"number",
            "isPublic": "boolean"
          }
        } 
    */
    req.body.updaterId = req.user.id;
    const delivery = await Vehicle.findByPk(req.params.id);
    let isUpdated
    if ((req.user.role === 1 && delivery.DriverId === req.user.id) || req.user.role === 5) {
      isUpdated = await Vehicle.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });
    } else {
      throw new Error("You are not authorized for this action.");
    }


    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Vehicle.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Delete vehicle with ID'
        #swagger.description = `
          <b>-</b> Send access token in header. <br>
          <b>-</b> This function returns data includes remaning items.
        `
        #swagger.parameters['hardDelete'] = {
          in: 'query',
          type: 'boolean',
          description:'Send true for hard deletion, default value is false which is soft delete.'}
    */

    const hardDelete = req.query.hardDelete === "true";
    if (req.user.role !== 5 && hardDelete) throw new Error('You are not authorized for permanent deletetion!')

    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) throw new Error('Vehicle not found or already deleted.')
    vehicle.updaterId = req.user.id;
    const isDeleted = await vehicle.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The vehicle id ${vehicle.id} has been deleted.`
        : "Vehicle not found or something went wrong.",
      data: await req.getModelList(Vehicle),
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Restore deleted vehicle with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const vehicle = await Vehicle.findByPk(req.params.id, { paranoid: false });
    if (!vehicle) throw new Error("Vehicle not Found.");
    vehicle.updaterId = req.user.id;
    const isRestored = await vehicle.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Vehicle restored successfuly."
        : "Vehicle not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
    /* 
     #swagger.tags = ['Vehicle']
     #swagger.summary = 'Multiple-Delete  Vehicle with ID'
     #swagger.description = `
       <b>-</b> Send access token in header. <br>
       <b>-</b> This function returns data includes remaning items.
     `
      #swagger.parameters['body'] = {
         in: 'body',
         description: '
           <ul> 
             <li>You must write the IDs of the vehicles you want to delete into the array.</li>
           </ul> ',
         required: true,
         schema: {
           "ids": [1,2,3]
           
         }
       } 
   */
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty IDs array in the request body.");
    }

    let totalDeleted = 0;

    for (const id of ids) {
      const vehicle = await Vehicle.findByPk(id);

      if (vehicle) {
        vehicle.updaterId = req.user.id;
        await vehicle.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The vehicle id's ${ids} has been deleted.`
        : "Vehicle not found or something went wrong.",
      data: await req.getModelList(Vehicle),
    });
  },
};
