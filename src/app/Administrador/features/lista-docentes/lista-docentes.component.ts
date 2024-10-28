import { Component, inject } from '@angular/core';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-docentes',
  standalone: true,
  imports: [RouterModule, RouterLink],
  templateUrl: './lista-docentes.component.html',
  styleUrl: './lista-docentes.component.scss'
})
export default class ListaDocentesComponent {

  private _authState = inject(AuthStateService);
  private _router = inject(Router);
  async logOut(){
    await this._authState.logOut();
    this._router.navigateByUrl('/auth/sign-in');
  }
}
