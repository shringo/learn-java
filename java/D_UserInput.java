import java.util.Scanner;

public class D_UserInput {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);
        System.out.print("What's your favorite color");

        String color = scanner.nextLine();
        System.out.println("You like the color " + color + ", but I like red");

    }

}
