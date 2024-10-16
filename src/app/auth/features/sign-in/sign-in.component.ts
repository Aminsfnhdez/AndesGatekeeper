import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { hasEmailError, isRequired } from '../utils/validators';


export interface FormSignIn{
  email: FormControl <string | null>;
  password: FormControl <string | null>;
}
@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export default class SignInComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError(){
    return hasEmailError(this.form);
  }


  form = this._formBuilder.group<FormSignIn>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', Validators.required),
  });

  async submit(){
    if (this.form.invalid) return;

    try {
      const {email, password} = this.form.value;

    if(!email || !password) return;

    console.log({email, password});

    await this._authService.signIn({email, password});  
    
    toast.success('Hola nuevamente');
    this._router.navigateByUrl('/administrador'); // acá se debe corregir por perfiles y que lleve al 'home'
    } catch (error) {
      toast.error('Ocurrio un error')
    }
  }
}
