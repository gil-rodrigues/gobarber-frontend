import React, { useCallback, useRef } from 'react';
import { FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useHistory, useLocation } from 'react-router-dom';

import { useToast } from '../../hooks/toast';

import getValidationErrors from '../../utils/getValidationErrors';

import logoImg from '../../assets/logo.svg';

import { Container, Content, Background, AnimationContainer } from './styles';

import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();

  const history = useHistory();
  const location = useLocation();

  console.log(location);

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          password: Yup.string().required('Password obrigatória'),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password'), (null as unknown) as string],
            'As passwords não coincidem'
          )
        });

        await schema.validate(data, {
          abortEarly: false
        });

        // eslint-disable-next-line camelcase
        const { password, password_confirmation } = data;
        const token = location.search.replace('?token=', '');

        if (!token) throw new Error();

        await api.post('/password/reset', {
          password,
          passwordConfirmation: password_confirmation,
          token
        });

        addToast({
          type: 'success',
          title: 'Login com sucesso',
          description: 'Pode utilizar a aplicação!'
        });

        history.push('/signin');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
        }

        addToast({
          type: 'error',
          title: 'Erro no fazer o reset da Password',
          description:
            'Ocorreu um erro ao fazer reset da password, tente novamente.'
        });
      }
    },
    [addToast, history, location]
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Fazer reset da password</h1>

            <Input
              icon={FiLock}
              name="password"
              type="password"
              placeholder="Nova password"
            />

            <Input
              icon={FiLock}
              name="password_confirmation"
              type="password"
              placeholder="Confirmação da password"
            />

            <Button type="submit">Alterar a password</Button>
          </Form>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;
