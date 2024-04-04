import { ActionFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { eq } from "drizzle-orm/sql"
import { db } from "~/data/db.server"
import { menu } from "~/data/menu.server"
import { Cart } from "~/data/schema.server"
import { Image } from "@unpic/react"

export function loader() {
    return { menu }
}

export async function action({ request }: ActionFunctionArgs) {
    let formData = await request.formData()
    let itemName = String(formData.get("add-to-cart"))

    let menuItems = menu.map(section => section.items).flat()
    let menuItem = menuItems.find(i => i.name === itemName)!

    let cartItems = await db.select().from(Cart)

    if (cartItems.map(i => i.name).includes(menuItem.name)) {
        let cartItem = cartItems.find(i => i.name === menuItem.name)!
        await db
            .update(Cart)
            .set({ count: cartItem.count + 1 })
            .where(eq(Cart.name, menuItem.name))
    } else {
        await db.insert(Cart).values({
            id: crypto.randomUUID(),
            user: "me",
            name: menuItem.name,
            price: menuItem.price,
            count: 1,
        })
    }

    return null
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
})

export default function Menu() {
    let { menu } = useLoaderData<typeof loader>()

    return (
        <div className="flex flex-col items-center pt-12">
            <h1 className="text-4xl font-semibold leading-6 text-gray-900">Menu</h1>
            <ul role="list" className="flex flex-col items-center gap-6 pb-20 pt-12">
                {menu.map(section => (
                    <li className="flex flex-col items-center gap-6" key={section.name}>
                        <h2 className="text-2xl font-semibold leading-6 text-gray-900">
                            {section.name}
                        </h2>
                        <ul role="list" className="grid grid-cols-3 gap-6 px-6">
                            {section.items.map(item => (
                                <li
                                    key={item.name}
                                    className="col-span-1 flex flex-col divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-center shadow"
                                >
                                    <div className="flex flex-1 flex-col">
                                        {item.image.src && (
                                            <Image
                                                className="h-56"
                                                src={item.image.src}
                                                alt={item.image.alt}
                                                height={250}
                                                width={600}
                                            />
                                        )}
                                        <div className="flex flex-col items-start gap-3 p-6">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {item.name}
                                            </h3>
                                            <dl className="flex flex-grow flex-col justify-between">
                                                <dt className="sr-only">Title</dt>
                                                <dd className="text-sm text-gray-500">
                                                    {currencyFormatter.format(item.price)}
                                                </dd>
                                            </dl>
                                            <Form method="post">
                                                <button
                                                    type="submit"
                                                    className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                                                    name="add-to-cart"
                                                    value={item.name}
                                                >
                                                    Add to Cart
                                                </button>
                                            </Form>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    )
}
