import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // private privateUserSignal = signal<User | null>(null);
  // userSignal = this.privateUserSignal.asReadonly();

  // constructor() {
  //   this.fetchUser(1);
  // }

  // async fetchUser(userId: number): Promise<User> {
  //   await this.delay(1000);

  //   const mockUser: User = {
  //     id: userId,
  //     name: 'Gentleman Programming',
  //     age: 32,
  //     role: ROLES.admin,
  //   };

  //   this.privateUserSignal.set(mockUser);
  //   return mockUser;
  // }
}
