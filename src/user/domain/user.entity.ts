import { TimestampEntity } from '../../common/timestamp.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Record } from '../../record/domain/record.entity';
import { Review } from '../../review/domain/review.entity';
import { Tag } from '../../record/domain/tag.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  _email: string;

  @Column()
  private password: string;

  @Column()
  _nickname: string;

  @OneToMany(() => Record, (record) => record._writer)
  _records: Record[];

  @OneToMany(() => Review, (review) => review._writer)
  _reviews: Review[];

  @OneToMany(() => Tag, (tag) => tag._user)
  _tags: Tag[];

  static async create(params: {
    id?: number;
    email: string;
    password: string;
    nickname: string;
  }): Promise<User> {
    const { email, password, nickname, id } = params;
    const user = new User();
    if (id) {
      user._id = id;
    }
    user._email = email;
    const hashedPassword = await user.hashPassword(password);
    user.password = hashedPassword;
    user._nickname = nickname;
    return user;
  }

  public getId(): number {
    return this._id;
  }

  public getEmail(): string {
    return this._email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getNickname(): string {
    return this._nickname;
  }

  public getRecords(): Record[] {
    return this._records;
  }

  public getReviews(): Review[] {
    return this._reviews;
  }

  public getTags(): Tag[] {
    return this._tags;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  public async updatePassword(newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    this.password = hashedPassword;
  }

  public updateNickname(newNickname: string): void {
    this._nickname = newNickname;
  }
}
