#[allow(duplicate_alias)]
module 0x0::marketplace {
    use sui::dynamic_object_field as ofield;
    use sui::tx_context::TxContext;
    use sui::object::{Self, ID, UID};
    use sui::coin::Coin;
    use sui::table::{Self, Table};
    use sui::coin;
    use sui::event;
    use sui::transfer;

    /// For when amount paid does not match the expected.
    const EAmountIncorrect: u64 = 0;
    /// For when someone tries to delist without ownership.
    const ENotOwner: u64 = 1;
    /// For when an item is not found
    const EItemNotFound: u64 = 2;

    public struct ItemListed has copy, drop {
        item_id: ID,
        price: u64,
        seller: address,
    }

    /// A shared `Marketplace`. Can be created by anyone using the
    /// `create` function. One instance of `Marketplace` accepts
    /// only one type of Coin - `COIN` for all its listings.
    public struct Marketplace<phantom COIN> has key, store {
        id: UID,
        items: Table<ID, Listing>,
        payments: Table<address, Coin<COIN>>
    }


    /// A single listing which contains the listed item and its
    /// price in [`Coin<COIN>`].
    public struct Listing has key, store {
        id: UID,
        ask: u64,
        owner: address,
    }

    /// Create a new shared Marketplace.
    public entry fun create<COIN>(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let items = table::new<ID, Listing>(ctx);
        let payments = table::new<address, Coin<COIN>>(ctx);
        transfer::share_object(Marketplace<COIN> { 
            id, 
            items,
            payments
        });
    }


    /// List an item at the Marketplace.
    public entry fun list<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item: T,
        ask: u64,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let mut listing = Listing {
            id: object::new(ctx),
            ask,
            owner: tx_context::sender(ctx),
        };

        ofield::add(&mut listing.id, true, item);
        table::add(&mut marketplace.items, item_id, listing);
        
        event::emit(ItemListed {
            item_id,
            price: ask,
            seller: tx_context::sender(ctx),
        });
    }

    /// Internal function to remove listing and get an item back. Only owner can do that.
    fun delist<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        ctx: &TxContext
    ): T {
        assert!(table::contains(&marketplace.items, item_id), EItemNotFound);
        let listing = table::borrow_mut(&mut marketplace.items, item_id);
        
        assert!(tx_context::sender(ctx) == listing.owner, ENotOwner);

        let Listing {
            mut id,
            owner: _,
            ask: _,
        } = table::remove(&mut marketplace.items, item_id);

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    /// Call [`delist`] and transfer item to the sender.
    public entry fun delist_and_take<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        ctx: &mut TxContext
    ) {
        let item = delist<T, COIN>(marketplace, item_id, ctx);
        transfer::public_transfer(item, tx_context::sender(ctx));
    }

    /// Internal function to purchase an item using a known Listing. Payment is done in Coin<C>.
    /// Amount paid must match the requested amount. If conditions are met,
    /// owner of the item gets the payment and buyer receives their item.
    fun buy<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
    ): T {
        assert!(table::contains(&marketplace.items, item_id), EItemNotFound);
        let listing = table::borrow_mut(&mut marketplace.items, item_id);
        
        assert!(listing.ask == coin::value(&paid), EAmountIncorrect);

        // Remove the listing
        let Listing {
            mut id,
            ask: _,
            owner
        } = table::remove(&mut marketplace.items, item_id);

        // Transfer payment directly to the seller
        transfer::public_transfer(paid, owner);

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    /// Call [`buy`] and transfer item to the sender.
    public entry fun buy_and_take<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            buy<T, COIN>(marketplace, item_id, paid),
            tx_context::sender(ctx)
        );
    }

    /// Internal function to take profits from selling items on the `Marketplace`.
    fun take_profits<COIN>(
        marketplace: &mut Marketplace<COIN>,
        ctx: &TxContext
    ): Coin<COIN> {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&marketplace.payments, sender), EItemNotFound);
        table::remove(&mut marketplace.payments, sender)
    }

    #[lint_allow(self_transfer)]
    /// Call [`take_profits`] and transfer coins to the sender.
    public entry fun take_profits_and_keep<COIN>(
        marketplace: &mut Marketplace<COIN>,
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            take_profits(marketplace, ctx),
            tx_context::sender(ctx)
        );
    }
}
