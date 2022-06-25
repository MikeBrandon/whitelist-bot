import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
    url: 'https://sportstemplates.net',
    consumerKey: 'ck_e0fd19c1f911c57a765bb45f1c0042e5492b7397',
    consumerSecret: 'cs_e82c4e66a80570488470d9481261096a9faf07a9',
    version: 'wc/v3'
});

export const getOrders = () => {
    WooCommerce.get("orders")
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error.response.data);
        });
}