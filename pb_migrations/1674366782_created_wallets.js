migrate((db) => {
  const collection = new Collection({
    "id": "arw5zxs19jjtii3",
    "created": "2023-01-22 05:53:02.564Z",
    "updated": "2023-01-22 05:53:02.564Z",
    "name": "wallets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "7uxoez02",
        "name": "name",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "fcdf6gr4",
        "name": "address",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("arw5zxs19jjtii3");

  return dao.deleteCollection(collection);
})
