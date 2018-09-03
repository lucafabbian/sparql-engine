/* file : minus-test.js
MIT License

Copyright (c) 2018 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

const expect = require('chai').expect
const { getGraph, TestEngine } = require('../utils.js')

describe('SPARQL MINUS', () => {
  let engine = null
  before(() => {
    const g = getGraph('./tests/data/dblp.nt')
    engine = new TestEngine(g)
  })

  it('should evaluate SPARQL queries with MINUS clauses', done => {
    const query = `
    PREFIX dblp-rdf: <https://dblp.uni-trier.de/rdf/schema-2017-04-18#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT * WHERE {
      ?s ?p ?o .
      MINUS { ?s rdf:type dblp-rdf:Person . }
    }`
    let nbResults = 0
    const iterator = engine.execute(query)
    iterator.on('error', done)
    iterator.on('data', b => {
      expect(b).to.have.keys('?s', '?p', '?o')
      expect(b['?s']).to.be.oneOf([
        'https://dblp.uni-trier.de/pers/m/Minier:Thomas',
        'https://dblp.org/pers/m/Minier:Thomas.nt'
      ])
      nbResults++
    })
    iterator.on('end', () => {
      expect(nbResults).to.equal(6)
      done()
    })
  })

  it('should evaluate SPARQL queries with MINUS clauses that found nothing', done => {
    const query = `
    PREFIX dblp-rdf: <https://dblp.uni-trier.de/rdf/schema-2017-04-18#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT * WHERE {
      ?s rdf:type dblp-rdf:Person .
      MINUS { ?s dblp-rdf:primaryFullPersonName ?name }
    }`
    let nbResults = 0
    const iterator = engine.execute(query)
    iterator.on('error', done)
    iterator.on('data', b => {
      nbResults++
    })
    iterator.on('end', () => {
      expect(nbResults).to.equal(0)
      done()
    })
  })
})
