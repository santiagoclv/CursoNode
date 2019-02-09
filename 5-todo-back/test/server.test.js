const request = require('supertest');
const expect = require('expect');

const { server } = require('./../server');
const { Todo, mongoose } = require('./../models/todo');


describe('MongoDB connexion', () => {

    it('should test the connection to mongodb through mongoose', (done) => {
        
        expect(mongoose.connections.length).toBeGreaterThan(0);
        expect(mongoose.connections[0]).toBeA(mongoose.Connection);

        done();
    });
});


describe('POST /todos', () => {

    it('should create a new Todo item', (done) => {
        const text = "Todo Text";
        const title = "Todo Title";
        let _id = null;
        request(server)
            .post('/todos')
            .send({text, title})
            .expect(200)
            .expect( res => {
                _id = res.body._id;
                expect(res.body).toInclude({text, title})
            })
            .end( (err, res) => {
                if(err){
                    done(err)
                }
                
                Todo.findById(_id).then( (todo) => {
                    expect(todo).toInclude({text, title});
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create a Todo item with invalid body data', (done) => {
        let items = null;
        Todo.find().then( (todos) => {
            items = todos.length;

            request(server)
            .post('/todos')
            .send({})
            .expect(400)
            .end( (err, res) => {
                if(err){
                    done(err)
                }
                
                Todo.find().then( (todos) => {
                    expect(todos.length).toBe(items);
                    done();
                }).catch((e) => done(e));
            });
        }).catch((e) => done(e));
    });
});


describe('GET /todos', () => {

    it('should return a list of the existent Todo items', (done) => {
        request(server)
            .get('/todos')
            .expect(200)
            .expect( res => {
                expect(res.body.todos).toBeA('object');
                expect(res.body.todos.length).toBeA('number');
            })
            .end(done);
    });
});

