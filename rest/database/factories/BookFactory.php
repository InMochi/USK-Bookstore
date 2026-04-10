<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'            => fake()->sentence(3),
            'publication_date' => fake()->date(),
            'author_id'        => Author::factory(),
            'price'            => fake()->numberBetween(50000, 250000),
            'image' => "https://picsum.photos/seed/" . fake()->uuid() . "/400/600",
            'edition'          => fake()->randomElement(['First Edition', 'Gold Edition', 'Revised Edition']),
            'status'           => fake()->randomElement(['available', 'not_available']),
            'stock'            => fake()->numberBetween(0, 100),
            'genre'            => fake()->randomElement(['Fiction', 'Science', 'History', 'Biography', 'Fantasy']),
        ];
    }
}