# Problem 3: WalletPage Code Review

This answer reviews the provided React and TypeScript component, lists the main computational inefficiencies and anti-patterns, and provides a cleaner refactored version.

## Issues Found

### 1. Incorrect or broken logic

- `lhsPriority` is used inside the `filter` callback but is never defined. The intended variable is probably `balancePriority`.
- The filtering condition is reversed. It currently keeps balances with `amount <= 0`, but wallet rows normally should show balances with a valid blockchain priority and a positive amount.
- The `sort` callback does not return a value when two priorities are equal. A comparator should always return a number.
- `formattedBalances` is created but never used. The rows are mapped from `sortedBalances`, so `balance.formatted` is `undefined`.
- `WalletBalance` does not define `blockchain`, even though the component reads `balance.blockchain`.

### 2. Unnecessary recomputation

- `getPriority` is declared inside the component, so it is recreated on every render even though it has no dependency on props or state.
- Priority is calculated multiple times: once during filtering and again during sorting. This is small here, but it becomes wasteful as the balance list grows.
- `formattedBalances` is recalculated on every render instead of being included in the memoized transformation.
- `rows` is rebuilt on every render. This is often acceptable for small lists, but the current implementation also maps from the wrong data source.

### 3. Incorrect hook dependencies

- `prices` is included in the `useMemo` dependency array for `sortedBalances`, but prices are not used inside that memo.
- Because of that, every price update causes filtering and sorting to run again unnecessarily.
- If `getPriority` remained inside the component, it would also need to be handled as a dependency. Moving it outside the component is simpler.

### 4. React anti-patterns

- `key={index}` is unstable for a sorted list. React can reuse the wrong row when balances are inserted, removed, or reordered.
- `children` is destructured but not rendered.
- `Props extends BoxProps`, but the component renders a native `<div>`. If `BoxProps` is expected, the component should render `<Box>`.
- `React.FC<Props>` is unnecessary here and can make `children` less explicit.

### 5. TypeScript and formatting issues

- `blockchain: any` removes type safety.
- The priority values are better represented as a constant map instead of a `switch`.
- `toFixed()` defaults to zero decimal places, which may be inaccurate for token balances.
- `prices[balance.currency] * balance.amount` can produce `NaN` when a price is missing.

## Refactored Version

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const BLOCKCHAIN_PRIORITY = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

type SupportedBlockchain = keyof typeof BLOCKCHAIN_PRIORITY;

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITY[blockchain as SupportedBlockchain] ?? -99;
};

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(amount);
};

const WalletPage = ({ children, ...rest }: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance: WalletBalance) => {
        return getPriority(balance.blockchain) > -99 && balance.amount > 0;
      })
      .sort((left: WalletBalance, right: WalletBalance) => {
        return getPriority(right.blockchain) - getPriority(left.blockchain);
      })
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: formatAmount(balance.amount),
      }));
  }, [balances]);

  return (
    <Box {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => {
        const price = prices[balance.currency] ?? 0;
        const usdValue = price * balance.amount;

        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}-${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
      {children}
    </Box>
  );
};
```

## Further Optimization

For a larger list, priority can be calculated once per balance before sorting:

```tsx
const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
  return balances
    .map((balance: WalletBalance) => ({
      balance,
      priority: getPriority(balance.blockchain),
    }))
    .filter(({ balance, priority }) => {
      return priority > -99 && balance.amount > 0;
    })
    .sort((left, right) => {
      return right.priority - left.priority;
    })
    .map(({ balance }) => ({
      ...balance,
      formatted: formatAmount(balance.amount),
    }));
}, [balances]);
```

This version avoids repeated priority lookups during sorting while keeping the component easier to reason about.
