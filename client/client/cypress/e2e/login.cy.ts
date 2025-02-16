describe('Spotify Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the Spotify logo', () => {
    cy.get('img[alt="Spotify Logo"]').should('be.visible');
  });

  it('should display the login button', () => {
    cy.get('button')
      .should('contain', 'Login with Spotify')
      .should('be.visible')
      .should('have.class', 'border-[#1DB954]');
  });

  it('should mock Spotify login and redirect back to the app', () => {
    cy.intercept('GET', '**/authorize?**', (req) => {
      req.reply({ statusCode: 302, headers: { location: 'http://localhost:4200/login?code=mock-code' } });
    });

    cy.get('button').click();
    cy.url().should('include', '/login?code=mock-code');
  });
});
