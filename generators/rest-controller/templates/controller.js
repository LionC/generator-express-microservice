const router = require('express').Router()
const assertError = require('assert').ifError
<% if(json) { %>const bodyParser = require('body-parser')<% } %>

//var jsonSchemaMiddleware = require('json-schema-validation-middleware');
<% if(crud) { %>const db = require('mongoennung')<% } %>

//var newUserSchema = require('./new-user.schema.json');
<% if(crud) { %>
const collection = db.collection('<%= collection %>')
<% } %>

<% if(json) { %>
router.use(bodyParser.json())
<% } %>

router.route('/')
    .post(handlePost)
    .get(handleGetAll)

router.param('id', idMiddleware)

router.route('/:id')
    .get(handleGetOne)
    .patch(handlePatch)
    .put(handlePut)
    .delete(handleDelete)

function handlePut(req, res) {
    <% if(crud) { %>
    <% } %>
    collection.replaceOne({ _id: req.<%= entityName %>._id }, transformToInner(req.<%= entityName %>), onReplaced)

    function onReplaced(err, result) {
        assertError(err)

        return res.status(204).send('')
    }
}

function handleGetAll(req, res) {
    <% if(crud) { %>
    collection.find({}).map(transformToOuter).toArray(onFind)

    function onFind(err, result) {
        assertError(err)

        res.status(200).json(result)
    }
    <% } %>
}

function handleGetOne(req, res) {
    <% if(crud) { %>
    res.status(200).json(req.<%= entityName %>)
    <% } %>
}

function handlePost(req, res) {
    <% if(crud) { %>
    var <%= entityName %> = req.body

    collection.findOne({ _id: <%= entityName %>.<%= id %> }, { _id: 1 }, onFind)

    function onFind(err, result) {
        assertError(err)

        if(!!result)
            return res.status(409).send('A <%= entityName %> with that <%= id %> already exists')

        <%= entityName %> = transformToInner(<%= entityName %>)

        collection.insertOne(<%= entityName %>, onInserted)
    }

    function onInserted(err, result) {
        res.set('Location', '/<%= collection %>/' + <%= entityName %>._id)
        return res.status(201).json(result.ops[0])
    }
    <% } %>
}

function handlePatch(req, res) {
    <% if(crud) { %>
    collection.updateOne(
        { _id: req['<%= entityName %>']._id },
        { $set: req.body },
        onUpdated
    )

    function onUpdated(err) {
        assertError(err)

        res.status(204).send()
    }
    <% } %>
}

function handleDelete(req, res) {
    <% if(crud) { %>
    collection.remove({
        _id: req['<%= entityName %>']._id
    }, onDeleted)

    function onDeleted(err) {
        if(err)
            return res.status(500).send('Error while deleting <%= entityName %>: ' + err)

        return res.status(204).send('')
    }
    <% } %>
}

function idMiddleware(req, res, next, id) {
    <% if(crud) { %>
    collection.findOne({ _id: id }, onFind)

    function onFind(err, result) {
        assertError(err)

        if(!result)
            res.status(404).send()

        req['<%= entityName %>'] = result

        next()
    }
    <% } %>
}

<% if(crud) { %>
function transformToInner(<%= entityName %>) {
    <%= entityName %>._id = <%= entityName %>.<%= id %>
    delete <%= entityName %>.<%= id %>

    return <%= entityName %>
}

function transformToOuter(<%= entityName %>) {
    <%= entityName %>.<%= id %> = <%= entityName %>._id
    delete <%= entityName %>._id

    return <%= entityName %>
}
<% } %>

module.exports = router
