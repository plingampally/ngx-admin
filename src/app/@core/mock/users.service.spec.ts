import { TestBed } from '@angular/core/testing';

import { UserService } from './users.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getContacts should emit 6 contacts with user name and type', (done) => {
    service.getContacts().subscribe(contacts => {
      expect(contacts.length).toBe(6);
      contacts.forEach(contact => {
        expect(contact.user.name).toBeTruthy();
        expect(contact.type).toBeTruthy();
      });
      done();
    });
  });

  it('getRecentUsers should emit 8 entries with numeric time', (done) => {
    service.getRecentUsers().subscribe(recentUsers => {
      expect(recentUsers.length).toBe(8);
      recentUsers.forEach(recentUser => {
        expect(typeof recentUser.time).toBe('number');
      });
      done();
    });
  });

  it('getUsers should emit users including nick', (done) => {
    service.getUsers().subscribe(users => {
      expect(users.nick).toBeTruthy();
      expect(users.nick.name).toBe('Nick Jones');
      done();
    });
  });
});
