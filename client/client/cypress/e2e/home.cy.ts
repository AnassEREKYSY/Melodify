describe('Home Page After Login', () => {
    beforeEach(() => {
        cy.visit('/home');
    });
  
    it('should display followed artists', () => {
      cy.get('.artists-container h2').should('contain', 'Followed Artists');
      cy.get('.artist-card').should('have.length.greaterThan', 0);
    });
  
    it('should display playlists', () => {
      cy.get('.playlists-container h2').should('contain', 'Playlists');
      cy.get('.playlist-card').should('have.length.greaterThan', 0);
    });
  });
  