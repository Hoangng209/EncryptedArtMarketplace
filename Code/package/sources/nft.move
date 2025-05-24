#[allow(duplicate_alias)]
module 0x0::nft {
    use std::string;
    use sui::url::{Self, Url};
    use sui::object;
    use sui::tx_context::TxContext;
    use sui::event;
    use sui::transfer;

    // Struct represent the NFT item
    public struct NFT has key, store {
        id: UID,
        /// Name for the token
        name: string::String,
        /// Description of the token
        description: string::String,
        /// URL for the token
        url: Url,
    }
    
    public struct NFTMinted has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The creator of the NFT
        creator: address,
        // The name of the NFT
        name: string::String,
        // The description of the NFT
        description: string::String,
        // The url of the NFT
        url: Url,
    }

    public struct NFTTransfered has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The sender of the NFT
        sender_nft: address,
        // The receive of the NFT
        receive: address,
    }

    public struct NFTDescriptionUpdated has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The creator update description
        creator_updated: address,
        // The new description updated
        new_description_updated: string::String,
    }

    public struct NFTBurned has copy, drop {
        // The creator update description
        creator_burned: address,
    }

    // ===== Public view functions =====

    /// Get the NFT's `ID`
    public fun get_id(nft: &NFT): &UID {
        &nft.id
    }

    /// Get the NFT's `name`
    public fun get_name(nft: &NFT): &string::String {
        &nft.name
    }

    /// Get the NFT's `description`
    public fun get_description(nft: &NFT): &string::String {
        &nft.description
    }

    /// Get the NFT's `url`
    public fun get_url(nft: &NFT): &Url {
        &nft.url
    }

    // ===== Entrypoints =====

    #[allow(lint(self_transfer))]
    public fun mint_to_sender(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let nft = NFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            url: url::new_unsafe_from_bytes(url),
        };

        event::emit(NFTMinted {
            object_id: object::id(&nft),
            creator: sender,
            name: nft.name,
            description: nft.description,
            url: nft.url,
        });

        transfer::public_transfer(nft, sender);
    }

    /// Transfer `nft` to `recipient`
    public fun transfer(
        nft: NFT, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        event::emit(NFTTransfered {
            object_id: object::id(&nft),
            sender_nft: sender,
            receive: recipient,
        });

        transfer::public_transfer(nft, recipient)
    }

    /// Update the `description` of `nft` to `new_description`
    public fun update_description(
        nft: &mut NFT,
        new_description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        event::emit(NFTDescriptionUpdated {
            object_id: object::id(nft),
            creator_updated: sender,
            new_description_updated: string::utf8(new_description)
        });

        nft.description = string::utf8(new_description)
    }

    /// Permanently delete `nft`
    public fun burn(
        nft_burn: NFT, 
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        event::emit(NFTBurned {
            creator_burned: sender
        });

        let NFT { id, name: _, description: _, url: _ } = nft_burn;
        object::delete(id)
    } 
}
