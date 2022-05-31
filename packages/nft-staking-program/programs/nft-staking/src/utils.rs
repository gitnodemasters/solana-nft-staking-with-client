use anchor_lang::prelude::*;
use anchor_lang::solana_program::{clock};
use std::convert::TryInto;
use crate::{Pool, User};

const PRECISION: u128 = u64::MAX as u128;

// update user pending reward, update user last update time
#[inline(always)]
pub fn update_rewards(
    pool: &ProgramAccount<Pool>,
    user: &mut ProgramAccount<User>,
) -> ProgramResult {
    let clock = clock::Clock::get().unwrap();
    let now = clock.unix_timestamp.try_into().unwrap();
    // calculate time elapsed since last update
    let time_diff = std::cmp::max(now - user.last_update_time, 0 as u64);
    // update user reward to pass it to pending reward
    user.reward_earned_pending = earned(
        time_diff,
        user.mint_staked_count,
        pool.reward_rate_per_token,
        user.reward_earned_pending,
    );
    // update time in user account
    user.last_update_time = now;
    Ok(())
}

#[inline(always)]
pub fn earned(
    elapsed_time: u64,
    balance_staked: u32,
    reward_rate_per_token: u128,
    user_reward_per_token_pending: u64,
) -> u64 {
    /*
    earned reward = (now - last_update_time) * reward rate * balance_staked + user_rewards_x_pending
    returns new pending rewards
     */
    let earned = (reward_rate_per_token as u128)
        .checked_div(PRECISION)
        .unwrap()
        .checked_mul(balance_staked as u128)
        .unwrap()
        .checked_mul(elapsed_time as u128)
        .unwrap()
        .checked_add(user_reward_per_token_pending as u128)
        .unwrap()
        .try_into()
        .unwrap();

    msg!("reward_rate_per_token {}", reward_rate_per_token);
    msg!("precision {}", PRECISION);
    msg!("balance_staked {}", balance_staked);
    msg!("elapsed_time {}", elapsed_time);
    msg!("user_reward_per_token_pending {}", user_reward_per_token_pending);
    msg!("reward_earned_pending {}", earned);
    return earned;
}