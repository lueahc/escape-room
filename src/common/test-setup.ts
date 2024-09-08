import { StoreRepository } from '../store/domain/store.repository';
import { ThemeRepository } from '../theme/domain/theme.repository';
import { Store } from '../store/domain/store.entity';
import { Theme } from '../theme/domain/theme.entity';
import { LocationEnum } from '../store/domain/location.enum';
import * as request from 'supertest';

let app;

export const setAppInstance = (appInstance) => {
  app = appInstance;
};

// 회원가입
export const signUpUser = async (
  email: string,
  password: string,
  nickname: string,
) => {
  return await request(app.getHttpServer()).post('/user/signUp').send({
    email,
    password,
    nickname,
  });
};

// 로그인
export const signInUser = async (email: string, password: string) => {
  return await request(app.getHttpServer()).post('/user/signIn').send({
    email,
    password,
  });
};

// 토큰 가져오기
export const getAccessToken = async (email: string, password: string) => {
  const response = await signInUser(email, password);
  return response.body.accessToken;
};

// record 생성
export const createRecord = async (accessToken: string) => {
  return await request(app.getHttpServer())
    .post('/record')
    .set('Authorization', `Bearer ${accessToken}`)
    .field('themeId', 1)
    .field('isSuccess', 'true')
    .field('playDate', '2024-01-01')
    .field('headCount', 4);
};

// review 생성
export const createReview = async (accessToken: string) => {
  return await request(app.getHttpServer())
    .post('/review')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      recordId: 1,
    });
};

// 매장 2개 & 테마 2개 생성
export const createTestStoresAndThemes = async (
  storeRepository: StoreRepository,
  themeRepository: ThemeRepository,
) => {
  const store1 = new Store({
    name: 'test store1 name',
    location: LocationEnum.KANGNAM,
    address: 'test store1 address',
    phoneNo: 'test store1 phoneNo',
    homepageUrl: 'test store1 homepageUrl',
  });
  await storeRepository.save(store1);

  await themeRepository.save(
    new Theme({
      name: 'test theme1 name',
      image: 'test theme1 image',
      plot: 'test theme1 plot',
      genre: 'test theme1 genre',
      time: 70,
      level: 1,
      price: 27000,
      note: 'test theme1 note',
      store: store1,
    }),
  );

  await themeRepository.save(
    new Theme({
      name: 'test theme2 name',
      image: 'test theme2 image',
      plot: 'test theme2 plot',
      genre: 'test theme2 genre',
      time: 70,
      level: 1,
      price: 27000,
      note: 'test theme2 note',
      store: store1,
    }),
  );

  const store2 = new Store({
    name: 'test store2 name',
    location: LocationEnum.HONGDAE,
    address: 'test store2 address',
    phoneNo: 'test store2 phoneNo',
    homepageUrl: 'test store2 homepageUrl',
  });
  await storeRepository.save(store2);

  await themeRepository.save(
    new Theme({
      name: 'test theme3 name',
      image: 'test theme3 image',
      plot: 'test theme3 plot',
      genre: 'test theme3 genre',
      time: 70,
      level: 1,
      price: 27000,
      note: 'test theme3 note',
      store: store2,
    }),
  );

  await themeRepository.save(
    new Theme({
      name: 'test theme4 name',
      image: 'test theme4 image',
      plot: 'test theme4 plot',
      genre: 'test theme4 genre',
      time: 70,
      level: 1,
      price: 27000,
      note: 'test theme4 note',
      store: store2,
    }),
  );
};
