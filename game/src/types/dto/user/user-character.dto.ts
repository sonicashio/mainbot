export class UserCharacterDto {
    public unlocked!: boolean;
    public selected!: boolean;
    public currentLevel!: number;
    public rank!: number;
    public name!: string;
    public price!: number;
    public levels!: { level: number; price: number; profit: number }[];
    public maxLevel!: number;
}
