describe('Access One App', () => {
  it('Successfully accessed the website', () => {
    cy.visit('http://localhost:4200/#/product-selection')
    cy.url().should('include', '/#/product-selection')
  })
})
