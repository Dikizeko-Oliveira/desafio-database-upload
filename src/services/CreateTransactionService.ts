import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepositoy = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Oporation failed, the balance is not enough');
    }

    let transactionCategory = await categoryRepositoy.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepositoy.create({
        title: category,
      });

      await categoryRepositoy.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
